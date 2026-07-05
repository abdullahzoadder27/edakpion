import { supabase, isMockData } from './supabase';
import { Product } from '../types';
import { mockProducts } from './data';

// Add mock blogs for fallback
export const mockBlogs = [
  {
    id: '1',
    title: 'How to Style Oversized T-Shirts in 2025',
    slug: 'how-to-style-oversized-t-shirts-in-2025',
    excerpt: 'Discover the best ways to style your oversized t-shirts for a modern, relaxed look.',
    content: 'Full content goes here...',
    status: 'published',
    published_at: new Date().toISOString(),
    cover_image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Why Fabric Quality Matters in Premium Clothing',
    slug: 'why-fabric-quality-matters',
    excerpt: 'Learn why investing in high-quality fabrics is essential for longevity and comfort.',
    content: 'Full content goes here...',
    status: 'published',
    published_at: new Date().toISOString(),
    cover_image_url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export async function getProducts(): Promise<Product[]> {
  if (isMockData) return mockProducts;
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true);
      
    if (error) {
      // console.error('Error fetching products:', error);
      return mockProducts; // Fallback to mock data if table doesn't exist or error
    }
    
    if (data && data.length > 0) {
      return data as Product[];
    }
    
    return mockProducts; // Fallback to mock data if empty
  } catch (error) {
    console.error('Exception fetching products:', error);
    return mockProducts;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (isMockData) return mockProducts.find(p => p.slug === slug) || null;
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();
      
    if (error || !data) {
      // Fallback
      const mockProduct = mockProducts.find(p => p.slug === slug);
      return mockProduct || null;
    }
    
    return data as Product;
  } catch (error) {
    console.error('Exception fetching product:', error);
    const mockProduct = mockProducts.find(p => p.slug === slug);
    return mockProduct || null;
  }
}

export async function getPublishedBlogs(limit?: number) {
  if (isMockData) return limit ? mockBlogs.slice(0, limit) : mockBlogs;
  try {
    let query = supabase
      .from('blogs')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false });
      
    if (limit) {
      query = query.limit(limit);
    }
      
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    // console.error('Error fetching blogs:', error);
    return [];
  }
}

export async function getBlogBySlug(slug: string) {
  if (isMockData) return mockBlogs.find(b => b.slug === slug) || null;
  try {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    // console.error('Error fetching blog:', error);
    return null;
  }
}
