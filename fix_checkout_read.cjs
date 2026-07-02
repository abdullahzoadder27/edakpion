const fs = require('fs');
let content = fs.readFileSync('src/pages/Checkout.tsx', 'utf8');

const targetRender = `<p className="text-sm font-medium text-gray-900">{addr.full_name}</p>
                          <p className="text-xs text-gray-500 mt-1">{addr.address_line1}, {addr.city}, {addr.state} - {addr.postal_code}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{addr.phone}</p>`;

const replaceRender = `<p className="text-sm font-medium text-gray-900">{addr.full_name}</p>
                          <p className="text-xs text-gray-500 mt-1">{addr.street_address}, {addr.district}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{addr.phone_number}</p>`;

content = content.replace(targetRender, replaceRender);
fs.writeFileSync('src/pages/Checkout.tsx', content);
