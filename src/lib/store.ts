import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '../types';
import { supabase } from './supabase';

interface CartItemState {
  id: string; // local id or supabase cart id
  product: Product;
  quantity: number;
  selected_size?: string;
  selected_color?: string;
  db_id?: string; // id from carts table
}

interface CartStore {
  items: CartItemState[];
  setItems: (items: CartItemState[]) => void;
  addItem: (product: Product, quantity: number, size?: string, color?: string) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getSubtotal: () => number;
  syncCart: () => Promise<void>;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      setItems: (items) => set({ items }),
      
      addItem: async (product, quantity, size, color) => {
        const { items } = get();
        const existingItemIndex = items.findIndex(
          (i) => i.product.id === product.id && i.selected_size === size && i.selected_color === color
        );

        let newItems = [...items];
        let dbId: string | undefined;

        if (existingItemIndex > -1) {
          newItems[existingItemIndex].quantity += quantity;
        } else {
          newItems.push({
            id: `${product.id}-${size}-${color}-${Date.now()}`,
            product,
            quantity,
            selected_size: size,
            selected_color: color,
          });
        }
        
        // Optimistic UI Update
        set({ items: newItems });

        // Database Sync
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          try {
            if (existingItemIndex > -1) {
              const item = newItems[existingItemIndex];
              if (item.db_id) {
                await supabase
                  .from('carts')
                  .update({ quantity: item.quantity })
                  .eq('id', item.db_id);
              } else {
                // Fetch first if db_id missing
                const { data } = await supabase
                  .from('carts')
                  .select('id')
                  .eq('user_id', session.user.id)
                  .eq('product_id', product.id)
                  .eq('selected_size', size || '')
                  .eq('selected_color', color || '')
                  .single();
                  
                if (data) {
                  await supabase.from('carts').update({ quantity: item.quantity }).eq('id', data.id);
                  set((state) => {
                    const stItems = [...state.items];
                    const idx = stItems.findIndex(i => i.id === item.id);
                    if (idx > -1) stItems[idx].db_id = data.id;
                    return { items: stItems };
                  });
                }
              }
            } else {
              const { data, error } = await supabase
                .from('carts')
                .insert({
                  user_id: session.user.id,
                  product_id: product.id,
                  quantity,
                  selected_size: size,
                  selected_color: color
                })
                .select('id')
                .single();
                
              if (!error && data) {
                set((state) => {
                  const stItems = [...state.items];
                  // Find the newly added item and set db_id
                  const added = stItems.find(i => i.product.id === product.id && i.selected_size === size && i.selected_color === color);
                  if (added) added.db_id = data.id;
                  return { items: stItems };
                });
              }
            }
          } catch (e) {
            console.warn('Error syncing add to cart:', e);
          }
        }
      },
      
      removeItem: async (id) => {
        const itemToRemove = get().items.find(i => i.id === id);
        
        // Optimistic UI Update
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }));

        if (itemToRemove?.db_id) {
          await supabase.from('carts').delete().eq('id', itemToRemove.db_id);
        } else if (itemToRemove) {
           // fallback logic
           const { data: { session } } = await supabase.auth.getSession();
           if (session?.user) {
             await supabase.from('carts').delete()
               .eq('user_id', session.user.id)
               .eq('product_id', itemToRemove.product.id)
               .eq('selected_size', itemToRemove.selected_size || '')
               .eq('selected_color', itemToRemove.selected_color || '');
           }
        }
      },
      
      updateQuantity: async (id, quantity) => {
        const item = get().items.find(i => i.id === id);
        if (!item) return;

        // Optimistic
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        }));

        if (item.db_id) {
          await supabase.from('carts').update({ quantity }).eq('id', item.db_id);
        }
      },
      
      clearCart: async () => {
        set({ items: [] });
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await supabase.from('carts').delete().eq('user_id', session.user.id);
        }
      },
      
      getSubtotal: () => {
        return get().items.reduce((total, item) => total + item.product.price * item.quantity, 0);
      },

      syncCart: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;
        
        try {
          // 1. Fetch DB Cart
          const { data: dbCartItems, error } = await supabase
            .from('carts')
            .select(`
              id,
              quantity,
              selected_size,
              selected_color,
              product:products (*)
            `)
            .eq('user_id', session.user.id);
            
          if (error) throw error;
          
          const { items: localItems } = get();
          
          // 2. Merge local items not in DB to DB
          for (const local of localItems) {
            const dbMatch = (dbCartItems as any[])?.find((dbItem: any) => 
              (Array.isArray(dbItem.product) ? dbItem.product[0].id : dbItem.product?.id) === local.product.id && 
              dbItem.selected_size === local.selected_size && 
              dbItem.selected_color === local.selected_color
            );
            
            if (!dbMatch) {
              await supabase.from('carts').insert({
                user_id: session.user.id,
                product_id: local.product.id,
                quantity: local.quantity,
                selected_size: local.selected_size,
                selected_color: local.selected_color
              });
            } else if (!local.db_id) {
               // Already exists in DB, maybe update quantity if local quantity > db quantity? 
               // For simplicity, we just keep the local quantity if it's different and larger
               if (local.quantity > dbMatch.quantity) {
                 await supabase.from('carts').update({ quantity: local.quantity }).eq('id', dbMatch.id);
               }
            }
          }
          
          // 3. Re-fetch final cart state
          const { data: finalDbItems } = await supabase
            .from('carts')
            .select(`
              id,
              quantity,
              selected_size,
              selected_color,
              product:products (*)
            `)
            .eq('user_id', session.user.id);
            
          if (finalDbItems) {
            const newCartState: CartItemState[] = finalDbItems.map((dbItem: any) => ({
              id: `${(Array.isArray(dbItem.product) ? dbItem.product[0] : dbItem.product).id}-${dbItem.selected_size}-${dbItem.selected_color}-${Date.now()}`,
              db_id: dbItem.id,
              product: Array.isArray(dbItem.product) ? dbItem.product[0] : dbItem.product,
              quantity: dbItem.quantity,
              selected_size: dbItem.selected_size,
              selected_color: dbItem.selected_color
            }));
            
            set({ items: newCartState });
          }
        } catch (error) {
          console.warn("Cart sync failed:", error);
        }
      }
    }),
    {
      name: 'edakpion-cart',
    }
  )
);
