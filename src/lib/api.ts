import { supabase } from './supabase';
import { Product } from '../types';


const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

function getCached<T>(key: string): T | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

function setCache(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() });
}

export async function getProducts(): Promise<Product[]> {
  const cacheKey = 'products_all';
  const cached = getCached<Product[]>(cacheKey);
  if (cached) return cached;
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(id, name, slug)')
      .eq('is_active', true);
      
    if (error) {
      console.warn('Supabase not configured, returning empty products list.');
      return []; 
    }
    
    const result = (data || []) as Product[];
    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.warn('Supabase exception, returning empty products list.');
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(id, name, slug)')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();
      
    if (error || !data) {
      return null;
    }
    
    return data as Product;
  } catch (error) {
    console.warn('Supabase exception, returning null product.');
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
    console.warn('Supabase not configured, returning empty blogs list.');
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
    console.warn('Supabase not configured, returning null blog.');
    return null;
  }
}
