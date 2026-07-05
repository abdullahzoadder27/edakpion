import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

export default function WishlistIconWithCount() {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isLoggedIn || !user) {
      setCount(0);
      return;
    }

    const fetchWishlistCount = async () => {
      try {
        const { count, error } = await supabase
          .from('wishlists')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
          
        if (!error && count !== null) {
          setCount(count);
        }
      } catch (err) {
        // console.error('Error fetching wishlist count:', err);
      }
    };

    fetchWishlistCount();

    // Subscribe to wishlists changes
    const wishlistSubscription = supabase
      .channel('wishlist-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wishlists',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchWishlistCount();
        }
      )
      .subscribe();

    return () => {
      wishlistSubscription.unsubscribe();
    };
  }, [user, isLoggedIn]);

  const handleClick = (e: React.MouseEvent) => {
    if (!isLoggedIn) {
      e.preventDefault();
      alert('Please login to view your wishlist.');
      navigate('/login');
    }
  };

  return (
    <Link 
      to={isLoggedIn ? "/account/wishlist" : "/login"} 
      onClick={handleClick}
      className="relative text-[#1A1A1A] hover:opacity-70 transition-opacity hidden sm:block"
    >
      <Heart className="w-5 h-5" />
      {count > 0 && (
        <span className="absolute -top-2 -right-2 bg-[#0F3D2E] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
          {count}
        </span>
      )}
    </Link>
  );
}
