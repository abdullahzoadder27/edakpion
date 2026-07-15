import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  
  console.log('Navigating to page...');
  await page.goto('http://localhost:3000/admin/hero-slides');
  await new Promise(r => setTimeout(r, 2000));
  
  const content = await page.content();
  console.log('HTML Length:', content.length);
  if (content.length < 500) {
    console.log('HTML snippet:', content);
  }
  
  await browser.close();
})();
