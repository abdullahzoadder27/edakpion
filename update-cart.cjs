const fs = require('fs');
let content = fs.readFileSync('src/pages/Cart.tsx', 'utf8');

if (!content.includes('Coupon')) {
  // Add Coupon, VAT, Clear Cart, and Move to Wishlist
  content = content.replace(
    "<div className=\"flex justify-between items-center mt-6\">",
    `<div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
                  <div className="flex gap-2">
                    <button onClick={useCartStore.getState().clearCart} className="text-red-500 text-xs font-bold hover:underline">
                      CLEAR CART
                    </button>
                  </div>`
  );
  
  content = content.replace(
    "<span className=\"text-gray-500\">Delivery Charge</span>",
    `<span className="text-gray-500">VAT (0%)</span>
                  <span className="font-bold">৳0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Coupon Discount</span>
                  <span className="font-bold text-red-500">- ৳0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Delivery Charge</span>`
  );
  
  content = content.replace(
    "<h2 className=\"text-xl font-bold mb-6 pb-4 border-b\">ORDER SUMMARY</h2>",
    `<h2 className="text-xl font-bold mb-6 pb-4 border-b">ORDER SUMMARY</h2>
              
              {/* Coupon Code */}
              <div className="mb-6 pb-6 border-b border-[#E8E4DE]">
                <label className="block text-sm font-bold text-gray-700 mb-2">Have a coupon?</label>
                <div className="flex gap-2">
                  <input type="text" placeholder="Coupon Code" className="flex-1 border border-[#E8E4DE] rounded-xl p-3 outline-none focus:border-[#0F3D2E]" />
                  <button className="bg-black text-white px-6 py-3 rounded-xl font-bold text-xs tracking-widest uppercase hover:bg-gray-800 transition-colors">Apply</button>
                </div>
              </div>`
  );
  
  // Replace the item removal button to add 'Move to Wishlist'
  content = content.replace(
    /<button\s+onClick=\{\(\) => removeItem\(item\.id\)\}\s+className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors"\s+>\s+<Trash2 className="w-4 h-4" \/>\s+<\/button>/g,
    `<div className="flex flex-col items-end gap-2">
                            <button 
                              onClick={() => removeItem(item.id)}
                              className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={async () => {
                                const { supabase } = await import('../lib/supabase');
                                const { data: { session } } = await supabase.auth.getSession();
                                if (session?.user) {
                                  await supabase.from('wishlists').insert([{ user_id: session.user.id, product_id: item.product.id }]);
                                } else {
                                  let guestWishlist = JSON.parse(localStorage.getItem('guest_wishlist') || '[]');
                                  if (!guestWishlist.includes(item.product.id)) {
                                    guestWishlist.push(item.product.id);
                                    localStorage.setItem('guest_wishlist', JSON.stringify(guestWishlist));
                                  }
                                }
                                removeItem(item.id);
                              }}
                              className="text-[10px] font-bold text-gray-400 hover:text-[#0F3D2E] underline underline-offset-2 uppercase tracking-wider"
                            >
                              Move to Wishlist
                            </button>
                          </div>`
  );
  
  fs.writeFileSync('src/pages/Cart.tsx', content);
}
