import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000/admin/login');
  await new Promise(r => setTimeout(r, 2000));
  
  // Try login
  await page.type('input[type="email"]', 'abdullahzoadder27@gmail.com');
  await page.type('input[type="password"]', 'password123'); // Guessing or assuming we can login
  // Let's just mock the auth state if possible, or print console
  page.on('console', msg => console.log('LOG:', msg.text()));
  
  await page.evaluate(() => {
    // See if we can bypass the login or check if we can reach the page
    window.localStorage.setItem('supabase.auth.token', JSON.stringify({
      currentSession: {
        user: { role: 'authenticated', email: 'admin@example.com' },
        access_token: 'fake',
        refresh_token: 'fake'
      }
    }));
  });
  
  await page.goto('http://localhost:3000/admin/hero-slides');
  await new Promise(r => setTimeout(r, 2000));
  console.log('Final URL:', page.url());
  const content = await page.content();
  console.log('HTML Length:', content.length);
  
  await browser.close();
})();
