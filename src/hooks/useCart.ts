import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { products as mockProducts } from '../data';

export interface CartItem {
  id: string;
  quantity: number;
  product_id: string;
  products: any; // Product details
}

export function useCart() {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCart = async () => {
    setLoading(true);
    let items: CartItem[] = [];

    // Load from local storage
    const localCart = JSON.parse(localStorage.getItem('edakpion_cart') || '[]');
    items = [...localCart];

    // Load from supabase if user
    if (user && supabase) {
      try {
        const { data: cart } = await supabase
          .from('carts')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (cart) {
          const { data: dbItems, error } = await supabase
            .from('cart_items')
            .select('id, quantity, product_id, products(*)')
            .eq('cart_id', cart.id)
            .order('created_at', { ascending: true });
            
          if (!error && dbItems) {
             // merge db items
             items = [...items, ...dbItems];
          }
        }
      } catch (err) {
        // silent fail
      }
    }

    // Enhance local items with product details if missing
    items = items.map(item => {
      if (!item.products) {
         const mockProd = mockProducts.find(p => p.id === item.product_id);
         if (mockProd) {
            item.products = mockProd;
         } else {
            item.products = { name: 'Unknown Product', price: 0 };
         }
      }
      return item;
    });

    setCartItems(items);
    setLoading(false);
  };

  useEffect(() => {
    loadCart();
  }, [user]);

  const addToCart = async (productId: string, quantity: number = 1) => {
    // Check if it's a valid UUID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(productId);
    
    if (user && supabase && isUuid) {
      try {
        let cartId;
        const { data: cart } = await supabase.from('carts').select('id').eq('user_id', user.id).single();
        if (cart) {
          cartId = cart.id;
        } else {
          const { data: newCart, error: cartError } = await supabase.from('carts').insert({ user_id: user.id }).select('id').single();
          if (cartError) throw cartError;
          cartId = newCart.id;
        }

        const { data: existing } = await supabase.from('cart_items')
          .select('id, quantity')
          .eq('cart_id', cartId)
          .eq('product_id', productId)
          .single();
        
        if (existing) {
          await supabase.from('cart_items').update({ quantity: existing.quantity + quantity }).eq('id', existing.id);
        } else {
          await supabase.from('cart_items').insert({ 
            cart_id: cartId, 
            product_id: productId, 
            quantity: quantity 
          });
        }
        await loadCart();
        return { success: true };
      } catch (err) {
        console.error("Supabase cart error", err);
        // fallthrough to local
      }
    }

    // Fallback to local storage
    const localCart = JSON.parse(localStorage.getItem('edakpion_cart') || '[]');
    const existingIndex = localCart.findIndex((i: any) => i.product_id === productId);
    if (existingIndex >= 0) {
      localCart[existingIndex].quantity += quantity;
    } else {
      localCart.push({ 
        id: 'local-' + Date.now(), 
        product_id: productId, 
        quantity: quantity 
      });
    }
    localStorage.setItem('edakpion_cart', JSON.stringify(localCart));
    await loadCart();
    return { success: true };
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    if (itemId.startsWith('local-')) {
       const localCart = JSON.parse(localStorage.getItem('edakpion_cart') || '[]');
       const updated = localCart.map((i: any) => i.id === itemId ? { ...i, quantity: newQuantity } : i);
       localStorage.setItem('edakpion_cart', JSON.stringify(updated));
       await loadCart();
       return;
    }

    if (supabase) {
       try {
         await supabase.from('cart_items').update({ quantity: newQuantity }).eq('id', itemId);
         await loadCart();
       } catch (e) {
         // silent
       }
    }
  };

  const removeItem = async (itemId: string) => {
    if (itemId.startsWith('local-')) {
       const localCart = JSON.parse(localStorage.getItem('edakpion_cart') || '[]');
       const updated = localCart.filter((i: any) => i.id !== itemId);
       localStorage.setItem('edakpion_cart', JSON.stringify(updated));
       await loadCart();
       return;
    }

    if (supabase) {
       try {
         await supabase.from('cart_items').delete().eq('id', itemId);
         await loadCart();
       } catch (e) {
         // silent
       }
    }
  };
  
  const clearCart = async () => {
     localStorage.removeItem('edakpion_cart');
     if (user && supabase) {
        try {
           const { data: cart } = await supabase.from('carts').select('id').eq('user_id', user.id).single();
           if (cart) {
              await supabase.from('cart_items').delete().eq('cart_id', cart.id);
           }
        } catch (e) {
           // silent
        }
     }
     await loadCart();
  };

  return { cartItems, loading, addToCart, updateQuantity, removeItem, clearCart };
}
