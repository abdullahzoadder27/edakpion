const fs = require('fs');

const filepath = 'src/components/ui/HeroSlider.tsx';
let content = fs.readFileSync(filepath, 'utf8');

// Revert .eq('status', 'Published') to .eq('is_active', true)
content = content.replace(".eq('status', 'Published')", ".eq('is_active', true)");

fs.writeFileSync(filepath, content);
console.log('Fixed query in HeroSlider');
