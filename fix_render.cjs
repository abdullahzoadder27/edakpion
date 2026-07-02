const fs = require('fs');
let content = fs.readFileSync('src/pages/dashboard/Addresses.tsx', 'utf8');

const target3 = `<h3 className="font-bold text-lg line-clamp-1">{addr.title}</h3>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1 line-clamp-1">{addr.full_name}</p>
                    <p className="text-sm text-gray-500 mb-1">{addr.phone}</p>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-3">
                      {addr.address_line1} {addr.address_line2 && <><br />{addr.address_line2}</>}<br />
                      {addr.city}, {addr.state} - {addr.postal_code}<br />
                      {addr.country}
                    </p>`;

const replacement3 = `<h3 className="font-bold text-lg line-clamp-1">{addr.area}</h3>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1 line-clamp-1">{addr.full_name}</p>
                    <p className="text-sm text-gray-500 mb-1">{addr.phone_number}</p>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-3">
                      {addr.street_address}<br />
                      {addr.district}
                    </p>`;

content = content.replace(target3, replacement3);

fs.writeFileSync('src/pages/dashboard/Addresses.tsx', content);
