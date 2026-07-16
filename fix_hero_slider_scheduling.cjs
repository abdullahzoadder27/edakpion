const fs = require('fs');

const filepath = 'src/components/ui/HeroSlider.tsx';
let content = fs.readFileSync(filepath, 'utf8');

const regex = /if \(data && data\.length > 0\) \{\s*setSlides\(data\);\s*\}/;

const replacement = `
        if (data && data.length > 0) {
          const now = new Date();
          const validSlides = data.filter((s: any) => {
            if (s.start_date && new Date(s.start_date) > now) return false;
            if (s.end_date && new Date(s.end_date) < now) return false;
            return true;
          });
          
          if (validSlides.length > 0) {
            setSlides(validSlides);
          } else {
            // Provide a beautiful fallback slide if no active scheduled slides are found
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
          }
        }`;

content = content.replace(regex, replacement);

fs.writeFileSync(filepath, content);
console.log('Fixed HeroSlider scheduling');
