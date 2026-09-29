const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

(async () => {
  const root = path.resolve(__dirname, '../..');
  const output = path.join(root, 'tmp/catalog-plates');
  await fs.mkdir(output, { recursive: true });
  const jobs = JSON.parse(await fs.readFile(path.join(__dirname, 'narration.json')));
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 750 }, deviceScaleFactor: 1 });
    for (const name of jobs.filter(j => j.video).flatMap(j => j.plates)) {
      const svg = await fs.readFile(path.join(root, 'frontend/public/catalog', `${name}.svg`), 'utf8');
      await page.setContent(`<style>body{margin:0}</style>${svg}`);
      await page.screenshot({ path: path.join(output, `${name}.png`) });
    }
    console.log('Rendered 24 original composition plates.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
