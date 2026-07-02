import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ProductDetail, Review } from '../types';

export function useProductDetails(id?: string) {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    async function fetchDetails() {
      setLoading(true);
      if (!isSupabaseConfigured || !supabase) {
        setLoading(false);
        return;
      }
      try {
        const { data: prodData, error: prodErr } = await supabase
          .from('products')
          .select(`
            *,
            product_images(image_url),
            product_variants(size, color, price)
          `)
          .eq('id', id)
          .single();

        if (prodErr) throw prodErr;

        if (prodData) {
          const images = prodData.product_images?.map((img: any) => img.image_url) || [];
          if (images.length === 0) images.push('https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=600');
          
          const variants = prodData.product_variants || [];
          const sizes = [...new Set(variants.map((v: any) => v.size).filter(Boolean))] as string[];
          const colors = [...new Set(variants.map((v: any) => v.color).filter(Boolean))] as string[];
          
          const mappedProduct: ProductDetail = {
            id: prodData.id,
            name: prodData.name,
            price: prodData.price,
            originalPrice: prodData.compare_at_price || undefined,
            discountPercentage: prodData.compare_at_price ? Math.round(((prodData.compare_at_price - prodData.price) / prodData.compare_at_price) * 100) : undefined,
            imageUrl: images[0],
            images: images,
            category: prodData.category_id || 'Top Picks',
            brand: prodData.brand || 'EDAKPION',
            sku: prodData.sku,
            shortDescription: prodData.short_description || 'Premium quality product.',
            description: prodData.description || 'Elevate your everyday wardrobe with our premium product.',
            stockStatus: 'In Stock',
            stockCount: prodData.stock_quantity || 0,
            rating: 4.8, 
            reviewCount: 120,
            colors: colors.length > 0 ? colors : ['#000000', '#ffffff'],
            sizes: sizes.length > 0 ? sizes : ['S', 'M', 'L', 'XL'],
            badges: prodData.is_new_arrival ? ['New'] : (prodData.is_featured ? ['Premium'] : []),
            specifications: {
              'Brand': prodData.brand || 'EDAKPION',
              'Material': '100% Combed Cotton (200 GSM)',
              'Fit': 'Regular Fit',
              'Country': 'Made in Bangladesh',
            },
            highlights: [
              'Premium 200 GSM Cotton Fabric',
              'Soft & Comfortable feel',
              'Lightweight and Breathable'
            ]
          };
          
          setProduct(mappedProduct);
          setReviews([]); 
        }
      } catch (err: any) {
        setError(err.message);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [id]);

  return { product, reviews, loading, error };
}
