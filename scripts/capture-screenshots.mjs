import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const BASE = 'http://127.0.0.1:5185/';
const OUT = path.resolve('public/screenshots');

async function shot(page, name) {
  await page.screenshot({
    path: path.join(OUT, name),
    type: 'png',
    fullPage: false,
  });
  console.log(`saved ${name}`);
}

async function main() {
  await mkdir(OUT, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 960, height: 540 } });

  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await shot(page, 'tutorial-menu.png');

  await page.click('#start-btn');
  await page.waitForTimeout(600);
  await shot(page, 'tutorial-welcome.png');

  for (let i = 0; i < 5; i++) {
    const skip = page.locator('#tutorial-skip-btn');
    if (await skip.isVisible().catch(() => false)) {
      await skip.click();
      await page.waitForTimeout(400);
    }
    if (await page.locator('#action-btn').isVisible().catch(() => false)) break;
  }

  await page.waitForTimeout(1200);
  await shot(page, 'tutorial-combat.png');
  await shot(page, 'gameplay.png');
  await shot(page, 'tutorial-hud.png');

  await page.keyboard.press('KeyM');
  await page.waitForTimeout(500);
  await shot(page, 'tutorial-merchant.png');

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
