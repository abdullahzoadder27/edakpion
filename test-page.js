import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  
  try {
    const response = await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    console.log('STATUS:', response.status());
    const bodyHTML = await page.evaluate(() => document.body.innerHTML);
    if (bodyHTML.includes('Something went wrong')) {
       console.log('ERROR BOUNDARY TRIGGERED');
    }
  } catch (err) {
    console.log('NAVI ERROR:', err);
  }
  
  await browser.close();
})();
