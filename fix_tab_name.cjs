const fs = require('fs');
let content = fs.readFileSync('src/components/home/BestSellers.tsx', 'utf8');
content = content.replace(`useProducts('best-sellers')`, `useProducts('BEST SELLER')`);
fs.writeFileSync('src/components/home/BestSellers.tsx', content);

let content2 = fs.readFileSync('src/components/home/NewArrivalsCarousel.tsx', 'utf8');
content2 = content2.replace(`useProducts('new-arrivals')`, `useProducts('NEW ARRIVAL')`);
fs.writeFileSync('src/components/home/NewArrivalsCarousel.tsx', content2);
