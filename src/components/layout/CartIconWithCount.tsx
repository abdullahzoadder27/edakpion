import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useCartStore } from '../../lib/store';

export default function CartIconWithCount() {
  const cartItems = useCartStore((state) => state.items);
  const count = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  
  // Since we unified cart under /cart, we'll just link there for everyone
  return (
    <Link to="/cart" className="relative text-[#1A1A1A] hover:opacity-70 transition-opacity">
      <ShoppingBag className="w-5 h-5" />
      {count > 0 && (
        <span className="absolute -top-2 -right-2 bg-[#0F3D2E] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
          {count}
        </span>
      )}
    </Link>
  );
}
