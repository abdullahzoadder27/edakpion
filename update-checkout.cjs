const fs = require('fs');
const content = fs.readFileSync('src/pages/Checkout.tsx', 'utf8');

// Replace top imports to include useLocation
let newContent = content.replace(
  "import { useNavigate } from 'react-router-dom';",
  "import { useNavigate, useLocation } from 'react-router-dom';"
);

// Add location state reading
newContent = newContent.replace(
  "const { items, getSubtotal, clearCart } = useCartStore();",
  `const { items: cartItems, getSubtotal, clearCart } = useCartStore();
  const location = useLocation();
  const buyNowItem = location.state?.buyNowItem;
  
  const items = buyNowItem ? [buyNowItem] : cartItems;`
);

// Update subtotal calculation
newContent = newContent.replace(
  "const subtotal = getSubtotal();",
  `const subtotal = buyNowItem 
    ? (buyNowItem.product.price * buyNowItem.quantity) 
    : getSubtotal();`
);

// Update cart clear logic
newContent = newContent.replace(
  "// 4. Clear cart and redirect",
  `// 4. Clear cart if not buy now
      if (!buyNowItem) {
        clearCart();
      }`
);
newContent = newContent.replace(
  "clearCart();",
  "" // wait, it's already cleared in the block above
);

fs.writeFileSync('src/pages/Checkout.tsx', newContent);
