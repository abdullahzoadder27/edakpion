import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000/admin/hero-slides');
  await new Promise(r => setTimeout(r, 2000));
  
  const url = page.url();
  console.log('Current URL:', url);
  
  await browser.close();
})();
