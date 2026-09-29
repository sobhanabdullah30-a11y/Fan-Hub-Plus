const fs = require('node:fs/promises');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

(async () => {
  const base = process.env.FANHUB_API_URL || 'https://tech360-fanhub.runasp.net';
  const root = path.resolve(__dirname, '../..');
  const expected = JSON.parse(await fs.readFile(path.join(root, 'scripts/data/editorial-content.json')));
  const result = await (await fetch(`${base}/api/content?pageSize=100`)).json();
  const items = result.items.filter(i => i.tags.includes('fanhub-editorial-v2'));
  assert.equal(items.length, 60);
  for (const field of ['title', 'description', 'body']) assert.equal(new Set(items.map(i => i[field])).size, 60);
  assert.ok(!items.some(i => /\[Demo\]/i.test(i.title)));
  const counts = {};
  for (const item of items) counts[item.type] = (counts[item.type] || 0) + 1;
  console.log('Database content:', JSON.stringify(counts));
  const browser = await chromium.launch({ channel: 'msedge', headless: true, args: ['--autoplay-policy=no-user-gesture-required'] });
  const errors = [];
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage();
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(base);
    await page.getByText('Loading your universe…', { exact: true }).waitFor({ state: 'hidden', timeout: 60000 });
    for (let y = 0; y < await page.evaluate(() => document.body.scrollHeight); y += 750) {
      await page.evaluate(y => window.scrollTo(0, y), y);
      await page.waitForTimeout(120);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(root, 'artifacts/catalog-home.png'), fullPage: true });
    await page.locator('.sidebar').getByRole('button', { name: 'Explore', exact: true }).click();
    await page.locator('.content-card').first().waitFor();
    await page.waitForTimeout(2000);
    assert.equal(await page.locator('.content-card').count(), 12);
    for (let i = 0; i < 12; i += 3) {
      await page.locator('.content-card').nth(i).scrollIntoViewIfNeeded();
      await page.waitForTimeout(250);
    }
    await page.locator('.content-card').first().hover();
    await page.waitForTimeout(400);
    assert.notEqual(await page.locator('.content-card').first().evaluate(el => getComputedStyle(el).transform), 'none');
    await page.screenshot({ path: path.join(root, 'artifacts/catalog-desktop.png'), fullPage: true });
    const search = page.getByRole('textbox', { name: 'Search content', exact: true });
    await search.fill('The quiet frame');
    await page.waitForTimeout(1600);
    assert.equal(await page.locator('.content-card').count(), 1);
    await page.locator('.content-card .title-button').click();
    await page.getByRole('dialog').waitFor();
    assert.ok(await page.getByRole('dialog').getByRole('heading', { name: 'Start with the pause' }).count());
    await page.keyboard.press('Escape');
    await search.fill('');
    await page.waitForTimeout(1300);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: path.join(root, 'artifacts/catalog-mobile.png') });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    const faqs = await (await context.request.get(base + '/api/assistant/faqs')).json();
    assert.equal(faqs.length, 18);

    const media = await context.newPage();
    await media.goto(base);
    await media.setContent('<!doctype html><html><body></body></html>');
    for (const item of expected.filter(i => i.mediaUrl)) {
      const state = await media.evaluate(async ({ url, type }) => {
        const element = document.createElement(type === 'Video' ? 'video' : 'audio');
        element.muted = true;
        element.controls = true;
        element.src = url;
        document.body.replaceChildren(element);
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(Error('Media load timeout')), 30000);
          element.onloadedmetadata = () => { clearTimeout(timeout); resolve(); };
          element.onerror = () => { clearTimeout(timeout); reject(Error('Media decode error')); };
        });
        await element.play();
        await new Promise(resolve => setTimeout(resolve, 1000));
        const result = { duration: element.duration, time: element.currentTime, error: element.error?.code || null };
        element.pause();
        return result;
      }, { url: item.mediaUrl, type: item.type });
      assert.ok(state.duration > 5 && state.time > 0.2 && !state.error, item.key);
      if (item.type === 'Video') {
        const captions = await context.request.get(item.mediaUrl.replace('.mp4', '.vtt'));
        assert.ok(captions.ok());
        assert.ok((await captions.text()).startsWith('WEBVTT'));
      }
      console.log(`Playback passed: ${item.key} (${state.duration.toFixed(1)}s)`);
    }
    const reduced = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 390, height: 844 } });
    const quiet = await reduced.newPage();
    await quiet.goto(base);
    await quiet.locator('.app').waitFor();
    assert.equal(await quiet.locator('.app').getAttribute('data-motion'), 'off');
    assert.deepEqual(errors, []);
    await fs.writeFile(path.join(root, 'artifacts/catalog-verification.json'), JSON.stringify({ verifiedAt: new Date().toISOString(), counts, uniqueRecords: 60, publishedFaqs: 18, playableMedia: 16, mobileOverflow: false, reducedMotion: 'off', browserErrors: errors }, null, 2));
    console.log('PASS: unique database content, search/detail flow, desktop/mobile layout, 16 playable media files, eight caption files and reduced motion.');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
