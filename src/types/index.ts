export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price?: number;
  category_id?: string;
  categories?: Category;
  images: string[];
  stock: number;
  sizes: string[];
  colors: string[];
  tags: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  image_url?: string;
  created_at: string;
};

export type Profile = {
  id: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  role: 'user' | 'admin';
  address?: string;
  created_at: string;
};

export type CartItem = {
  id: string;
  product_id: string;
  quantity: number;
  selected_size?: string;
  selected_color?: string;
  product: Product; // joined
};

export type Order = {
  id: string;
  order_number?: string;
  user_id?: string;
  customer_name: string;
  phone: string;
  email: string;
  division: string;
  district: string;
  address: string;
  notes?: string;
  subtotal: number;
  delivery_charge: number;
  total: number;
  payment_method: string;
  payment_status: string;
  status: string;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
  selected_size?: string;
  selected_color?: string;
  image_url?: string;
};

export type Blog = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  cover_image_url?: string;
  category?: string;
  tags?: string[];
  author_id?: string;
  author_name?: string;
  status: 'draft' | 'published' | 'archived';
  is_featured: boolean;
  seo_title?: string;
  seo_description?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export type Address = {
  id: string;
  user_id: string;
  label: string;
  receiver_name: string;
  phone: string;
  alternative_phone?: string;
  division: string;
  district: string;
  area: string;
  postal_code?: string;
  full_address: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
};

export type Review = {
  id: string;
  user_id: string;
  product_id: string;
  order_id: string;
  order_item_id: string;
  rating: number;
  review_text?: string;
  review_image_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type?: string;
  related_id?: string;
  related_type?: string;
  is_read: boolean;
  created_at: string;
};

export type SupportTicket = {
  id: string;
  user_id: string;
  order_id?: string;
  subject: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
  updated_at: string;
  orders?: any;
};

export type SupportMessage = {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_role: string;
  message: string;
  attachment_url?: string;
  created_at: string;
};

export type Coupon = {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  created_at: string;
};

export interface HeroSlide {
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
}

export type ProductReview = {
  id: string;
  product_id: string;
  customer_name: string;
  review_text: string;
  rating: number;
  verified_buyer: boolean;
  customer_location?: string;
  customer_designation?: string;
  profile_image?: string;
  review_date: string;
  helpful_count: number;
  status: 'Published' | 'Draft' | 'Hidden';
  sort_order: number;
  admin_note?: string;
  admin_reply?: string;
  created_at: string;
  updated_at: string;
};

export interface HeroSettings {
  id: string;
  is_enabled: boolean;
  desktop_layout: string;
  tablet_layout: string;
  mobile_layout: string;
  desktop_height: string;
  tablet_height: string;
  mobile_height: string;
  container_width: string;
  content_alignment: string;
  character_position: string;
  character_size: string;
  section_padding: string;
  gap_text_character: string;

  bg_image_url?: string;
  bg_mobile_image_url?: string;
  bg_color: string;
  overlay_color: string;
  overlay_opacity: number;
  gradient_style: string;
  enable_spotlight: boolean;
  enable_jamdani: boolean;

  color_primary: string;
  color_secondary: string;
  color_accent: string;
  color_button_bg: string;
  color_button_text: string;
  color_button_hover: string;
  color_text_primary: string;
  color_text_secondary: string;

  font_family: string;
  heading_size_desktop: string;
  heading_size_tablet: string;
  heading_size_mobile: string;
  desc_size_desktop: string;
  desc_size_mobile: string;
  font_weight_heading: string;
  letter_spacing: string;
  line_height: string;

  anim_floating: boolean;
  anim_mouse_parallax: boolean;
  anim_fade: boolean;
  anim_slide: boolean;
  anim_character_scale: boolean;
  anim_speed: string;
  anim_duration: string;

  desktop_char_width: string;
  tablet_char_width: string;
  mobile_char_width: string;
  desktop_text_width: string;
  mobile_text_align: string;
  mobile_char_align: string;
  mobile_gap_headline_char: string;
  mobile_gap_char_desc: string;
  mobile_btn_width: string;

  seo_h1: string;
  seo_meta_title?: string;
  seo_meta_desc?: string;
  seo_image_alt?: string;
  seo_og_image?: string;
  
  updated_at: string;
}
