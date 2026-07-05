const fs = require('fs');
let content = fs.readFileSync('src/pages/ProductDetail.tsx', 'utf8');

// Replace useNavigate to handle Buy Now correctly
if (!content.includes('import { useNavigate } from')) {
    content = content.replace("import { Link, useParams } from 'react-router-dom';", "import { Link, useParams, useNavigate } from 'react-router-dom';");
}

// Add useNavigate hook
content = content.replace("const { slug } = useParams();", "const { slug } = useParams();\n  const navigate = useNavigate();");

// Add handleBuyNow
content = content.replace("const handleAddToCart = () => {", `const handleBuyNow = () => {
    if (product && product.stock > 0) {
      navigate('/checkout', {
        state: {
          buyNowItem: {
            id: 'buy-now',
            product,
            quantity,
            selected_size: selectedSize,
            selected_color: selectedColor
          }
        }
      });
    }
  };
  
  const handleAddToCart = () => {`);
  
// Add Buy Now button
content = content.replace(
  `{product.stock > 0 ? 'ADD TO CART' : 'OUT OF STOCK'}
              </button>`,
  `{product.stock > 0 ? 'ADD TO CART' : 'OUT OF STOCK'}
              </button>
              
              <button 
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="flex-1 bg-[#E8E4DE] text-[#0F3D2E] rounded-full font-bold text-xs tracking-widest uppercase hover:bg-[#d5cfc5] transition-colors disabled:opacity-50"
              >
                BUY NOW
              </button>`
);

// Fallback logic for wishlist in ProductDetail (guest support)
content = content.replace(
  "if (!session?.user) {\n      alert('Please log in to add to wishlist');\n      return;\n    }",
  `if (!session?.user) {
      let guestWishlist = JSON.parse(localStorage.getItem('guest_wishlist') || '[]');
      if (inWishlist) {
        guestWishlist = guestWishlist.filter((id: string) => id !== product.id);
        setInWishlist(false);
      } else {
        guestWishlist.push(product.id);
        setInWishlist(true);
      }
      localStorage.setItem('guest_wishlist', JSON.stringify(guestWishlist));
      return;
    }`
);

// Wishlist initial check
content = content.replace(
  "if (session?.user) {",
  `if (session?.user) {`
);

fs.writeFileSync('src/pages/ProductDetail.tsx', content);
