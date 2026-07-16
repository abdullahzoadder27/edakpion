const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  try {
    await page.waitForSelector('.swiper-wrapper', { timeout: 5000 });
    console.log('SUCCESS: Swiper slider found on page!');
    
    // Check if hero-pagination is there
    const hasPagination = await page.$('.hero-pagination');
    console.log('Has pagination:', !!hasPagination);
    
  } catch (err) {
    console.log('ERROR: Slider not found.', err.message);
  }
  
  await browser.close();
})();
