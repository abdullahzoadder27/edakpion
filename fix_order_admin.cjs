const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/OrderDetailAdmin.tsx', 'utf8');

code = code.replace(/product_name,/, `product_name,
            selected_size,
            selected_color,`);

const oldDiv = `<div className="flex-1">
                      <p className="font-bold text-[#0F3D2E]">{item.product_name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>`;
                    
const newDiv = `<div className="flex-1">
                      <p className="font-bold text-[#0F3D2E]">{item.product_name}</p>
                      <div className="text-xs text-gray-500 mt-1 flex gap-3">
                        {item.selected_color && <span>Color: {item.selected_color}</span>}
                        {item.selected_size && <span>Size: {item.selected_size}</span>}
                        <span>Qty: {item.quantity}</span>
                      </div>
                    </div>`;

code = code.replace(oldDiv, newDiv);

fs.writeFileSync('src/pages/admin/OrderDetailAdmin.tsx', code);
