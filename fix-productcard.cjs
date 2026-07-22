const fs = require('fs');
let code = fs.readFileSync('src/components/ui/ProductCard.tsx', 'utf8');

// Replace standard img tag with one having onError for main image
code = code.replace(
  /<img loading="lazy" decoding="async"\s*src=\{\(product\.images && product\.images\[0\]\)\}\s*alt=\{product\.name\}\s*className=\{`w-full h-full object-cover transition-opacity duration-500 \$\{\(product\.images && product\.images\[1\]\) \? 'group-hover:opacity-0' : 'group-hover:scale-105'\}`\}\s*onLoad=\{\(\) => setImageLoaded\(true\)\}\s*\/>/,
  `<img loading="lazy" decoding="async" 
          src={(product.images && product.images[0]) || 'https://placehold.co/400x500/F5F2ED/0F3D2E?text=No+Image'} 
          alt={product.name} 
          className={\`w-full h-full object-cover transition-opacity duration-500 \${(product.images && product.images[1]) ? 'group-hover:opacity-0' : 'group-hover:scale-105'}\`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://placehold.co/400x500/F5F2ED/0F3D2E?text=Error';
          }}
        />`
);

// Replace second image
code = code.replace(
  /<img loading="lazy" decoding="async"\s*src=\{\(product\.images && product\.images\[1\]\)\}\s*alt=\{product\.name\}\s*className="w-full h-full object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-105"\s*\/>/,
  `<img loading="lazy" decoding="async" 
            src={(product.images && product.images[1]) || 'https://placehold.co/400x500/F5F2ED/0F3D2E?text=No+Image'} 
            alt={product.name} 
            className="w-full h-full object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://placehold.co/400x500/F5F2ED/0F3D2E?text=Error';
            }}
          />`
);

fs.writeFileSync('src/components/ui/ProductCard.tsx', code);
console.log('ProductCard updated');
