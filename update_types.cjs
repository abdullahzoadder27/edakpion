const fs = require('fs');

const filepath = 'src/types/index.ts';
let content = fs.readFileSync(filepath, 'utf8');

const replacement = `export interface HeroSlide {
  id: string;
  title?: string;
  subtitle?: string;
  description?: string;
  image_url?: string;
  desktop_image?: string;
  mobile_image?: string;
  primary_button_text?: string;
  primary_button_url?: string;
  secondary_button_text?: string;
  secondary_button_url?: string;
  badge?: string;
  display_order: number;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  status?: string;
  background_color?: string;
  panel_color?: string;
  ghost_text?: string;
  animation_type?: string;
  autoplay_duration?: number;
  created_at: string;
  updated_at: string;
}`;

content = content.replace(/export interface HeroSlide \{[\s\S]*?updated_at: string;\n\}/m, replacement);
fs.writeFileSync(filepath, content);
console.log('Updated types');
