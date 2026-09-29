import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { Agent, request as httpsRequest } from 'node:https';

const base = process.env.FANHUB_API_URL?.replace(/\/$/, '');
const email = process.env.FANHUB_ADMIN_EMAIL;
const password = process.env.FANHUB_ADMIN_PASSWORD;
const apply = process.argv.includes('--apply');
const supportOnly = process.argv.includes('--support-only');
if (!base || !email || !password || new URL(base).protocol !== 'https:') {
  throw new Error('Set an HTTPS FANHUB_API_URL and the administrator environment credentials.');
}
const records = JSON.parse(await readFile(new URL('./data/editorial-content.json', import.meta.url)));
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
let token;
// Reuse one IPv4 connection for bulk publishing on shared IIS hosting.
const agent = new Agent({ keepAlive: true, maxSockets: 1, family: 4 });
function fetchCatalog(url, options = {}) {
  return new Promise((resolve, reject) => {
    const headers = { ...options.headers };
    if (options.body) headers['Content-Length'] = Buffer.byteLength(options.body);
    const req = httpsRequest(url, { method: options.method || 'GET', headers, agent, signal: options.signal }, response => {
      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('error', reject);
      response.on('end', () => {
        const status = response.statusCode;
        resolve(new Response(status === 204 ? null : Buffer.concat(chunks), { status, headers: response.headers }));
      });
    });
    req.on('error', reject);
    req.end(options.body);
  });
}
async function request(path, method = 'GET', body) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const response = await fetchCatalog(base + path, {
      method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(60000),
    });
    if (response.status === 429 && attempt < 3) {
      console.log('Rate limit reached; waiting before the next request.');
      await pause(30000); continue;
    }
    if (!response.ok) throw new Error(`${method} ${path}: ${response.status} ${(await response.text()).slice(0, 400)}`);
    return response.status === 204 ? null : response.json();
  }
}
try {
  token = (await request('/api/auth/login', 'POST', { email, password })).accessToken;
  const categories = await request('/api/categories');
  const existing = [];
  for (let page = 1; ; page++) {
    const result = await request(`/api/admin/content?page=${page}&pageSize=100`);
    existing.push(...result.items);
    if (existing.length >= result.total) break;
    if (!result.items.length) throw new Error('Incomplete content listing.');
  }
  const legacy = existing.filter(item => item.tags.includes('fanhub-demo-v1'));
  const used = new Set();
  const plan = records.map(record => {
    const categoryId = categories.find(c => c.name === record.category)?.id;
    if (!categoryId) throw new Error(`Missing category ${record.category}`);
    let match = existing.find(item => item.tags.includes('fanhub-editorial-v2') && item.tags.includes(record.key));
    match ||= legacy.find(item => !used.has(item.id) && item.categoryId === categoryId && item.type === record.type);
    if (match) used.add(match.id);
    return { record, categoryId, match };
  });
  // Reuse remaining demo IDs instead of deleting bookmarks or breaking saved links.
  for (const item of plan.filter(item => !item.match)) {
    item.match = legacy.find(record => !used.has(record.id));
    if (item.match) used.add(item.match.id);
  }
  console.log(JSON.stringify({ total: records.length, updates: plan.filter(p => p.match).length, creates: plan.filter(p => !p.match).length, unrelatedRecordsPreserved: existing.length - used.size }));
  if (apply && !supportOnly) {
    await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
    const backup = new URL(`../artifacts/catalog-before-${Date.now()}.json`, import.meta.url);
    await writeFile(backup, JSON.stringify(existing.filter(r => used.has(r.id)), null, 2));
    // All referenced media must be deployed and accessible before any database mutation.
    const assets = [...new Set(records.flatMap(r => [...r.imageUrls, r.mediaUrl].filter(Boolean)))];
    for (const [index, url] of assets.entries()) {
      let response;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          response = await fetchCatalog(url, { method: 'HEAD', signal: AbortSignal.timeout(30000) });
          if (response.status >= 500 && attempt < 2) { await pause(2000); continue; }
          break;
        } catch (error) {
          if (attempt === 2) throw new Error(`Cannot check ${url}: ${error.message}`);
          await pause(2000);
        }
      }
      const expected = /\.svg$/.test(url) ? 'image/' : /\.mp4$/.test(url) ? 'video/' : /\.mp3$/.test(url) ? 'audio/' : 'image/';
      if (!response.ok || !response.headers.get('content-type')?.startsWith(expected)) throw new Error(`Missing asset: ${url}`);
      if ((index + 1) % 20 === 0) console.log(`Checked ${index + 1}/${assets.length} assets.`);
    }
    console.log(`Verified ${assets.length} live media assets. Backup saved before changes.`);
    const manifest = [];
    for (const { record, categoryId, match } of plan) {
      const { key, category, ...fields } = record;
      const payload = { city: null, venue: null, latitude: null, longitude: null, startsAt: null, endsAt: null, releaseDate: null, ticketUrl: null, mediaUrl: null, ...fields, categoryId };
      const saved = await request(`/api/admin/content${match ? '/' + match.id : ''}`, match ? 'PUT' : 'POST', payload);
      manifest.push({ key, id: saved.id, title: saved.title, type: saved.type });
      console.log(`Saved ${saved.type}: ${saved.title}`);
      await pause(750);
    }
    await writeFile(new URL('../artifacts/catalog-manifest.json', import.meta.url), JSON.stringify(manifest, null, 2));
    // Public read-back establishes persistence and publication, not merely successful requests.
    const publicItems = [];
    for (let page = 1; ; page++) {
      const result = await request(`/api/content?page=${page}&pageSize=100`);
      publicItems.push(...result.items);
      if (publicItems.length >= result.total) break;
    }
    for (const record of records) {
      const saved = publicItems.find(r => r.tags.includes('fanhub-editorial-v2') && r.tags.includes(record.key));
      if (!saved || saved.title !== record.title || saved.body !== record.body || saved.imageUrls[0] !== record.imageUrls[0]) throw new Error(`Public read-back mismatch: ${record.key}`);
    }
    if (publicItems.some(r => r.tags.includes('fanhub-demo-v1'))) throw new Error('Legacy demo records remain published.');
    console.log(`Verified all ${records.length} records from the public database API; no legacy demo records remain published.`);
  }
  if (apply) {
    const faqs = JSON.parse(await readFile(new URL('./data/faq-content.json', import.meta.url)));
    const previousFaqs = await request('/api/admin/faqs');
    await writeFile(new URL(`../artifacts/support-before-${Date.now()}.json`, import.meta.url), JSON.stringify({ categories, faqs: previousFaqs }, null, 2));
    const descriptions = {
      Anime: 'Explore visual storytelling, atmospheric art and the original sky-mapping world of Lumen Crossing.',
      Gaming: 'Discover cooperative play, readable level design and the relay engineers of the fictional Relay Frontier.',
      Movies: 'Study light, objects and cinematic composition through original stories from The Last Lighthouse.',
      'TV Shows': 'Build a thoughtful watch club and follow the clues, recordings and missing hour of Archive Nine.',
      'K-Pop': 'Explore listening journals, fan-zine design and the fictional sound-collecting collective Prism Avenue.',
      Comics: 'Read the space between panels and travel the changing streets of the original Lantern District.',
      Manga: 'Practice gesture, monochrome composition and the folded-paper storytelling of Paper Harbor.',
      Cosplay: 'Plan wearable silhouettes, explore costume concepts and visit the original Aether Workshop.',
    };
    for (const category of categories) {
      if (descriptions[category.name]) await request(`/api/admin/categories/${category.id}`, 'PUT', { name: category.name, description: descriptions[category.name] });
    }
    for (const faq of faqs) {
      const match = previousFaqs.find(f => f.question === faq.question);
      await request(`/api/admin/faqs${match ? '/' + match.id : ''}`, match ? 'PUT' : 'POST', faq);
      await pause(500);
    }
    const publishedFaqs = await request('/api/assistant/faqs');
    if (faqs.some(f => !publishedFaqs.some(p => p.question === f.question && p.answer === f.answer))) throw new Error('FAQ read-back failed.');
    console.log(`Verified ${faqs.length} published database FAQs and updated eight category descriptions.`);
  }
} finally {
  try { if (token) await request('/api/auth/logout', 'POST'); }
  finally { agent.destroy(); }
}
