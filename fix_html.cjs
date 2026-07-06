const fs = require('fs');
let code = fs.readFileSync('src/pages/Checkout.tsx', 'utf8');

const regex = /<div className="grid grid-cols-1 md:grid-cols-2 gap-4">\s*<div className="space-y-1\.5">\s*<label className="text-sm font-bold text-gray-700">Division \*[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;

const checkoutFormReplace = `
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Delivery Area *</label>
                <select 
                  required 
                  value={selectedZoneId} 
                  onChange={(e) => {
                    setSelectedZoneId(e.target.value);
                    const zone = deliveryZones.find(z => z.id === e.target.value);
                    if (zone) {
                      setFormData({ ...formData, delivery_area: zone.city_name });
                    } else if (e.target.value === outsideZone.id) {
                      setFormData({ ...formData, delivery_area: outsideZone.city_name });
                    }
                  }} 
                  className="w-full px-4 py-2.5 bg-gray-50 border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20"
                >
                  <option value="">Select Delivery Area</option>
                  {insideZones.map(zone => (
                    <option key={zone.id} value={zone.id}>{zone.city_name}</option>
                  ))}
                  <option value={outsideZone.id}>{outsideZone.city_name}</option>
                </select>
              </div>
`;

code = code.replace(regex, checkoutFormReplace);
fs.writeFileSync('src/pages/Checkout.tsx', code);
