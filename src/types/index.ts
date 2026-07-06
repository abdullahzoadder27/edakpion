export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price?: number;
  category_id?: string;
  images: string[];
  stock: number;
  sizes: string[];
  colors: string[];
  tags: string[];
  status?: string;
  sku?: string;
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
