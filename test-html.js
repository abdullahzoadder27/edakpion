import puppeteer from 'puppeteer';
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  const bodyHTML = await page.evaluate(() => document.body.innerHTML);
  console.log(bodyHTML.length);
  if (bodyHTML.includes('EDAKPION | Premium Men')) console.log('HEADER FOUND');
  if (bodyHTML.includes('Shop Collection')) console.log('HERO FOUND');
  await browser.close();
})();
