const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/pages/**/*.tsx');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace <script> blocks
  content = content.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g, (match, p1) => {
    if (p1.includes('JSON.stringify')) {
      const inner = p1.trim().replace(/^\{/, '').replace(/\}$/, '').trim();
      return `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ${inner} }} />`;
    }
    return match;
  });

  fs.writeFileSync(file, content);
});
console.log('Fixed scripts');
