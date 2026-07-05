const fs = require('fs');
let content = fs.readFileSync('src/pages/ProductDetail.tsx', 'utf8');

if (!content.includes('const [activeTab, setActiveTab] = useState')) {
  // Add activeTab state
  content = content.replace(
    "const [inWishlist, setInWishlist] = useState(false);",
    "const [inWishlist, setInWishlist] = useState(false);\n  const [activeTab, setActiveTab] = useState('description');"
  );
  
  // Create Tabs section
  const tabsSection = `
        {/* Product Details Tabs */}
        <div className="mt-20 mb-20 bg-white rounded-3xl p-8 border border-[#E8E4DE]">
          <div className="flex flex-wrap gap-8 border-b border-[#E8E4DE] mb-8">
            {['description', 'specifications', 'reviews', 'shipping', 'return policy', 'faq'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={\`pb-4 font-bold text-sm tracking-widest uppercase transition-colors \${activeTab === tab ? 'text-[#0F3D2E] border-b-2 border-[#0F3D2E]' : 'text-gray-400 hover:text-gray-900'}\`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className="prose max-w-none text-gray-600 leading-relaxed min-h-[200px]">
            {activeTab === 'description' && (
              <div className="animate-in fade-in duration-500">
                <p>{product.description}</p>
                {product.features && product.features.length > 0 && (
                  <ul className="mt-6 space-y-2">
                    {product.features.map((f, i) => <li key={i} className="flex gap-2"><span className="text-[#0F3D2E]">✓</span>{f}</li>)}
                  </ul>
                )}
              </div>
            )}
            {activeTab === 'specifications' && (
              <div className="animate-in fade-in duration-500">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b"><td className="py-3 font-bold w-1/3">Brand</td><td className="py-3">EDAKPION</td></tr>
                    <tr className="border-b"><td className="py-3 font-bold w-1/3">SKU</td><td className="py-3">{product.sku || 'N/A'}</td></tr>
                    <tr className="border-b"><td className="py-3 font-bold w-1/3">Category</td><td className="py-3">{product.category_id || 'Uncategorized'}</td></tr>
                    <tr className="border-b"><td className="py-3 font-bold w-1/3">Material</td><td className="py-3">Premium Quality</td></tr>
                    <tr className="border-b"><td className="py-3 font-bold w-1/3">Country of Origin</td><td className="py-3">Bangladesh</td></tr>
                  </tbody>
                </table>
              </div>
            )}
            {activeTab === 'reviews' && (
              <div className="animate-in fade-in duration-500">
                <div className="flex items-center gap-4 mb-8">
                  <div className="text-4xl font-bold">4.8</div>
                  <div className="flex flex-col">
                    <div className="flex text-yellow-400">
                      <Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" />
                    </div>
                    <span className="text-xs text-gray-500 mt-1">Based on 124 reviews</span>
                  </div>
                </div>
                <p>Customer reviews will appear here.</p>
              </div>
            )}
            {activeTab === 'shipping' && (
              <div className="animate-in fade-in duration-500 space-y-4">
                <p><strong>Estimated Delivery:</strong> 3-5 Business Days (Inside Dhaka), 5-7 Business Days (Outside Dhaka)</p>
                <p><strong>Delivery Charge:</strong> ৳60 (Inside Dhaka), ৳120 (Outside Dhaka)</p>
                <p><strong>Cash on Delivery:</strong> Available for all locations.</p>
              </div>
            )}
            {activeTab === 'return policy' && (
              <div className="animate-in fade-in duration-500 space-y-4">
                <p>We offer a hassle-free 7-day return policy. If you are not completely satisfied with your purchase, you can return it within 7 days of delivery.</p>
                <p>Items must be unused, in original packaging, and with all tags attached.</p>
              </div>
            )}
            {activeTab === 'faq' && (
              <div className="animate-in fade-in duration-500 space-y-4">
                <div>
                  <strong className="block mb-1">Is this product authentic?</strong>
                  <p className="text-sm">Yes, all products on EDAKPION are 100% authentic and sourced directly from manufacturers or authorized distributors.</p>
                </div>
                <div>
                  <strong className="block mb-1">How do I track my order?</strong>
                  <p className="text-sm">Once your order is shipped, you will receive a tracking link via email and SMS.</p>
                </div>
              </div>
            )}
          </div>
        </div>
  `;
  
  content = content.replace(
    "{/* Related Products */}",
    tabsSection + "\n        {/* Related Products */}"
  );
  
  fs.writeFileSync('src/pages/ProductDetail.tsx', content);
}
