const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace all imports with lazy imports except for layout components (which wrap everything so they are needed initially)
const components = [
  'Home', 'Shop', 'ProductDetail', 'Cart', 'Checkout', 'OrderSuccess',
  'Login', 'Signup', 'ForgotPassword', 'UpdatePassword',
  'UserDashboard', 'UserOrders', 'UserOrderDetails', 'UserWishlist', 'UserAddresses',
  'UserReviews', 'UserCoupons', 'UserNotifications', 'UserSupport', 'UserSupportTicket',
  'UserProfile', 'UserSecurity', 'UserRecentlyViewed',
  'BlogList', 'BlogDetail',
  'About', 'OurStory', 'Contact', 'Faqs', 'Shipping', 'Returns', 'SizeGuide',
  'AdminDashboard', 'ProductsManage', 'AdminProductForm', 'CategoriesManage',
  'OrdersManage', 'OrderDetailAdmin', 'UsersManage',
  'AdminBlogs', 'AdminBlogForm', 'CouponsManage', 'ReviewsManage',
  'SubscribersManage', 'TestimonialsManage', 'ContentManage',
  'SupportManage', 'SupportTicketAdmin', 'NotificationsManage', 'DeliveryZonesManage', 'SettingsManage',
  'AdminLogin'
];

code = code.replace(/import { BrowserRouter, Routes, Route } from 'react-router-dom';/, "import { BrowserRouter, Routes, Route } from 'react-router-dom';\nimport { Suspense, lazy } from 'react';\nimport { Loader2 } from 'lucide-react';\n\nconst PageLoader = () => (\n  <div className=\"min-h-[60vh] flex items-center justify-center\">\n    <Loader2 className=\"w-8 h-8 animate-spin text-[#0F3D2E]\" />\n  </div>\n);\n");

components.forEach(comp => {
  const regex = new RegExp(`import ${comp} from '([^']+)';`, 'g');
  code = code.replace(regex, `const ${comp} = lazy(() => import('$1'));`);
});

code = code.replace(/<BrowserRouter>/, "<BrowserRouter>\n      <Suspense fallback={<PageLoader />}>");
code = code.replace(/<\/BrowserRouter>/, "      </Suspense>\n    </BrowserRouter>");

fs.writeFileSync('src/App.tsx', code);
