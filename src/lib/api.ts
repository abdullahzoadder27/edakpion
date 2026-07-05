import { supabase } from './supabase';
import { Product } from '../types';

export async function getProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true);
      
    if (error) {
      console.error('Error fetching products:', error);
      return []; 
    }
    
    return (data || []) as Product[];
  } catch (error) {
    console.error('Exception fetching products:', error);
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();
      
    if (error || !data) {
      return null;
    }
    
    return data as Product;
  } catch (error) {
    console.error('Exception fetching product:', error);
    return null;
  }
}

export async function getPublishedBlogs(limit?: number) {
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
    console.error('Error fetching blogs:', error);
    return [];
  }
}

export async function getBlogBySlug(slug: string) {
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
    console.error('Error fetching blog:', error);
    return null;
  }
}
