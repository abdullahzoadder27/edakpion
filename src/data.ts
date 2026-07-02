import { Product, Testimonial } from './types';

export const products: Product[] = [
  {
    id: '1',
    name: 'Oversized T-Shirt',
    price: 790.00,
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=600',
    category: 'Top Picks'
  },
  {
    id: '2',
    name: 'Casual Shirt',
    price: 1390.00,
    imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?auto=format&fit=crop&q=80&w=600',
    category: 'Top Picks'
  },
  {
    id: '3',
    name: 'Varsity Jacket',
    price: 2490.00,
    imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=600',
    category: 'Top Picks'
  },
  {
    id: '4',
    name: 'Printed Shirt',
    price: 1190.00,
    imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=600',
    category: 'Top Picks'
  },
  {
    id: '5',
    name: 'Cargo Vest',
    price: 1890.00,
    imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=600',
    category: 'Top Picks'
  },
  {
    id: '6',
    name: 'Windbreaker',
    price: 1590.00,
    imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=600',
    category: 'Top Picks'
  }
];

export const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Rifat Hasan',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    rating: 5,
    text: 'Excellent quality! The fabric is just awesome.'
  },
  {
    id: '2',
    name: 'Mahin Ahmed',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    rating: 5,
    text: 'Very comfortable and stylish. Love it!'
  }
];
