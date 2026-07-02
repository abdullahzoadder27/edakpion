export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  isWishlisted?: boolean;
}

export interface ProductDetail extends Product {
  brand?: string;
  collection?: string;
  sku?: string;
  productCode?: string;
  shortDescription?: string;
  description?: string;
  originalPrice?: number;
  discountPercentage?: number;
  saveAmount?: number;
  stockStatus?: 'In Stock' | 'Low Stock' | 'Out of Stock';
  stockCount?: number;
  soldCount?: number;
  rating?: number;
  reviewCount?: number;
  badges?: string[];
  images: string[];
  colors: string[];
  sizes: string[];
  specifications?: Record<string, string>;
  highlights?: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  text: string;
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
  avatar?: string;
}
