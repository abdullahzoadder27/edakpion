const fs = require('fs');
const file = 'src/components/ProductReviews.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /<script type="application\/ld\+json">\s*\{JSON\.stringify\(structuredData\)\}\s*<\/script>/,
  `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />`
);

fs.writeFileSync(file, content);
