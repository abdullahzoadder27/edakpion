const fs = require('fs');
let content = fs.readFileSync('src/pages/dashboard/Addresses.tsx', 'utf8');

const targetRender = `{addr.street_address} <br />
                      {addr.city}, {addr.state} - {addr.postal_code}<br />
                      {addr.country}`;
const replaceRender = `{addr.street_address} <br />
                      {addr.area ? addr.area + ', ' : ''}{addr.district}<br />
                      Bangladesh`;

content = content.replace(targetRender, replaceRender);
fs.writeFileSync('src/pages/dashboard/Addresses.tsx', content);
