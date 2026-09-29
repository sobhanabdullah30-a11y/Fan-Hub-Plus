import { readFile } from 'node:fs/promises';

const baseUrl = process.env.FANHUB_API_URL?.replace(/\/$/, '');
const email = process.env.FANHUB_ADMIN_EMAIL;
const password = process.env.FANHUB_ADMIN_PASSWORD;
const seedTag = 'fanhub-demo-v1';

if (!baseUrl || !email || !password) {
  throw new Error('Set FANHUB_API_URL, FANHUB_ADMIN_EMAIL and FANHUB_ADMIN_PASSWORD.');
}
if (new URL(baseUrl).protocol !== 'https:') {
  throw new Error('The target API must use HTTPS.');
}

const records = JSON.parse(await readFile(new URL('./data/demo-content.json', import.meta.url)));
let token;

async function request(path, method = 'GET', body) {
  const response = await fetch(baseUrl + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(60000),
  });
  if (!response.ok) {
    throw new Error(`${method} ${path} returned HTTP ${response.status}.`);
  }
  return response.status === 204 ? undefined : response.json();
}

// Validate remote assets before creating any database records.
const images = new Set(records.flatMap((record) => record.imageUrls));
const media = new Set(records.map((record) => record.mediaUrl).filter(Boolean));
for (const url of [...images, ...media]) {
  const response = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(30000) });
  const expectedType = images.has(url) ? 'image/' : url.endsWith('.mp4') ? 'video/' : 'audio/';
  if (!response.ok || !response.headers.get('content-type')?.startsWith(expectedType)) {
    throw new Error(`Asset is unavailable or has an unexpected content type: ${url}`);
  }
}
console.log(`Verified ${images.size} image URLs and ${media.size} media URLs.`);

try {
  token = (await request('/api/auth/login', 'POST', { email, password })).accessToken;
  const categories = await request('/api/categories');
  const existing = [];
  for (let page = 1; ; page++) {
    const result = await request(`/api/admin/content?page=${page}&pageSize=100`);
    existing.push(...result.items);
    if (existing.length >= result.total) break;
    if (!result.items.length) throw new Error('Unexpected empty page while checking existing content.');
  }

  const startDate = new Date();
  startDate.setUTCHours(12, 0, 0, 0);
  let created = 0;
  let skipped = 0;
  for (const record of records) {
    if (existing.some((item) => item.title === record.title && item.tags.includes(seedTag))) {
      skipped++;
      continue;
    }
    const { category, eventDayOffset, releaseDayOffset, ...payload } = record;
    payload.categoryId = categories.find((item) => item.name === category)?.id;
    if (!payload.categoryId) throw new Error(`Missing category: ${category}`);
    if (releaseDayOffset) {
      payload.releaseDate = new Date(startDate.getTime() + releaseDayOffset * 86400000).toISOString();
    }
    if (eventDayOffset) {
      const start = startDate.getTime() + eventDayOffset * 86400000;
      payload.startsAt = new Date(start).toISOString();
      payload.endsAt = new Date(start + 7200000).toISOString();
    }
    const saved = await request('/api/admin/content', 'POST', payload);
    const persisted = await request(`/api/content/${saved.id}`);
    if (persisted.title !== payload.title || !persisted.imageUrls?.length) {
      throw new Error(`Read-back failed for content ${saved.id}.`);
    }
    existing.push(saved);
    created++;
    console.log(`Saved ${payload.type}: ${payload.title}`);
  }
  console.log(`Complete: ${created} created, ${skipped} already present. Existing records were not changed.`);
} finally {
  if (token) await request('/api/auth/logout', 'POST');
}
