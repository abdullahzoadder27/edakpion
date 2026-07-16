const fs = require('fs');

const filepath = 'src/components/ui/HeroSlider.tsx';
let content = fs.readFileSync(filepath, 'utf8');

const fallbackSlide = `
            setSlides([
              {
                id: 'fallback-1',
                title: 'Discover Our<br/>Premium Collection',
                subtitle: 'WELCOME TO EDAKPION',
                description: 'Experience unparalleled quality and style with our latest curated selections.',
                image_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
                desktop_image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
                primary_button_text: 'Shop Now',
                primary_button_url: '/shop',
                badge: 'New Arrivals',
                is_active: true,
                display_order: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            ]);
`;

// In catch block, add the fallback slide
content = content.replace(
  "console.error('Error fetching hero slides:', err);",
  `console.error('Error fetching hero slides:', err);\n            // Provide a beautiful fallback slide on network error\n${fallbackSlide}`
);

fs.writeFileSync(filepath, content);
console.log('Fixed error fallback');
