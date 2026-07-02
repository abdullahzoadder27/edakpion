import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ProductDetail, Review } from '../types';
import { products as mockProductsList } from '../data';

// Enhanced mock data for details page
const mockProductDetails: Record<string, ProductDetail> = {
  '1': {
    id: '1',
    name: 'Premium Oversized T-Shirt',
    price: 790.00,
    originalPrice: 990.00,
    discountPercentage: 20,
    saveAmount: 200,
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=600',
    category: 'Top Picks',
    brand: 'EDAKPION',
    collection: 'Summer Collection \'25',
    sku: 'EDK-TS-001',
    productCode: 'PRD-10293',
    shortDescription: 'Premium quality oversized t-shirt made with the finest 100% combed cotton. Designed for ultimate comfort, breathability, and timeless street style.',
    description: 'Elevate your everyday wardrobe with our Premium Oversized T-Shirt. Crafted from ultra-soft, breathable 100% combed cotton, this tee offers a relaxed, drop-shoulder fit that drapes perfectly on any body type. Whether you are layering up or wearing it solo, its durable construction and rich color retention ensure it will remain a staple in your closet for seasons to come. Pre-shrunk and double-stitched for maximum longevity.',
    stockStatus: 'In Stock',
    stockCount: 15,
    soldCount: 1250,
    rating: 4.9,
    reviewCount: 248,
    badges: ['Best Seller', 'Trending', 'Premium'],
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&q=80&w=600',
    ],
    colors: ['#000000', '#ffffff', '#8a8d91', '#4a5d23'], // Black, White, Grey, Olive
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    specifications: {
      'Brand': 'EDAKPION',
      'Material': '100% Combed Cotton (200 GSM)',
      'Sleeve': 'Half Sleeve (Drop Shoulder)',
      'Neck': 'Round Neck',
      'Pattern': 'Solid',
      'Fit': 'Oversized Fit',
      'Gender': 'Unisex',
      'Season': 'All Season',
      'Country': 'Made in Bangladesh',
    },
    highlights: [
      'Premium 200 GSM Cotton Fabric',
      'Soft & Comfortable feel',
      'Lightweight and Breathable',
      'Long-lasting Color retention',
      'Pre-shrunk to minimize shrinkage'
    ]
  }
};

const mockReviews: Review[] = [
  {
    id: 'r1',
    userName: 'Rifat Hasan',
    rating: 5,
    date: '2 Days Ago',
    comment: 'Excellent quality! The fabric is just awesome and it fits exactly how I wanted it to. Fast delivery too.',
    verified: true,
  },
  {
    id: 'r2',
    userName: 'Mahin Ahmed',
    rating: 4,
    date: '1 Week Ago',
    comment: 'Very comfortable and stylish. Love the color options. Deducted one star because the packaging could be better.',
    verified: true,
  },
  {
    id: 'r3',
    userName: 'Sakib Rahman',
    rating: 5,
    date: '2 Weeks Ago',
    comment: 'Best oversized tee I have purchased recently. The material feels premium and thick without being hot.',
    verified: true,
  }
];

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
        // Mock fallback
        setTimeout(() => {
          const mockItem = mockProductsList.find(p => p.id === id);
          if (mockItem) {
             setProduct({
               ...mockProductDetails['1'],
               id: mockItem.id,
               name: mockItem.name,
               price: mockItem.price,
               originalPrice: mockItem.price + 200,
               imageUrl: mockItem.imageUrl,
               images: [mockItem.imageUrl, mockItem.imageUrl, mockItem.imageUrl]
             });
          } else {
             setProduct(mockProductDetails[id] || {
               ...mockProductDetails['1'],
               id,
               name: 'Generic Product ' + id
             });
          }
          setReviews(mockReviews);
          setLoading(false);
        }, 500);
        return;
      }

      try {
        // Fetch product
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
          
          // Basic mapping
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
            shortDescription: prodData.short_description || mockProductDetails['1'].shortDescription,
            description: prodData.description || mockProductDetails['1'].description,
            stockStatus: 'In Stock',
            stockCount: variants.length > 0 ? 15 : 15,
            rating: 4.8, // Mocking these since we don't aggregate them in DB yet
            reviewCount: 120,
            colors: colors.length > 0 ? colors : ['#000000', '#ffffff'],
            sizes: sizes.length > 0 ? sizes : ['S', 'M', 'L', 'XL'],
            badges: prodData.is_new_arrival ? ['New'] : (prodData.is_featured ? ['Premium'] : []),
            specifications: mockProductDetails['1'].specifications, // Using mock specs for now
            highlights: mockProductDetails['1'].highlights
          };
          
          setProduct(mappedProduct);
          setReviews(mockReviews); // Using mock reviews until full reviews table is populated
        }
      } catch (err: any) {
        // Silent catch for expected fallback
        setError(err.message);
        // Fallback
        
        const mockItem = mockProductsList.find(p => p.id === id);
        if (mockItem) {
           setProduct({
             ...mockProductDetails['1'],
             id: mockItem.id,
             name: mockItem.name,
             price: mockItem.price,
             originalPrice: mockItem.price + 200,
             imageUrl: mockItem.imageUrl,
             images: [mockItem.imageUrl, mockItem.imageUrl, mockItem.imageUrl]
           });
        } else {
           setProduct(mockProductDetails[id] || {
             ...mockProductDetails['1'],
             id,
             name: 'Generic Product ' + id
           });
        }
        
        setReviews(mockReviews);
      } finally {
        setLoading(false);
      }
    }

    fetchDetails();
  }, [id]);

  return { product, reviews, loading, error };
}
