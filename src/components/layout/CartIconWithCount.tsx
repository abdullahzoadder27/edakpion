import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { useCartStore } from '../../lib/store';

export default function CartIconWithCount() {
  const { user, isLoggedIn } = useAuth();
  const guestCartItems = useCartStore((state) => state.items);
  const guestCartCount = guestCartItems.reduce((acc, item) => acc + item.quantity, 0);
  
  const [dbCartCount, setDbCartCount] = useState(0);

  useEffect(() => {
    if (!isLoggedIn || !user) {
      setDbCartCount(0);
      return;
    }

    const fetchCartCount = async () => {
      try {
        const { count, error } = await supabase
          .from('carts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
          
        if (!error && count !== null) {
          setDbCartCount(count);
        }
      } catch (err) {
        // console.error('Error fetching cart count:', err);
      }
    };

    fetchCartCount();

    // Subscribe to carts changes for this user
    const cartSubscription = supabase
      .channel('cart-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'carts',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchCartCount();
        }
      )
      .subscribe();

    return () => {
      cartSubscription.unsubscribe();
    };
  }, [user, isLoggedIn]);

  const count = isLoggedIn ? dbCartCount : guestCartCount;
  const linkTo = isLoggedIn ? '/account/cart' : '/cart';

  return (
    <Link to={linkTo} className="relative text-[#1A1A1A] hover:opacity-70 transition-opacity">
      <ShoppingBag className="w-5 h-5" />
      {count > 0 && (
        <span className="absolute -top-2 -right-2 bg-[#0F3D2E] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
          {count}
        </span>
      )}
    </Link>
  );
}
