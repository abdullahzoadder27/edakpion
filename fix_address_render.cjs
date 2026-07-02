const fs = require('fs');
let content = fs.readFileSync('src/pages/dashboard/Addresses.tsx', 'utf8');

const targetRender = `{addr.address_line1} {addr.address_line2 && <><br />{addr.address_line2}</>}<br />`;
const replaceRender = `{addr.street_address} <br />`;

content = content.replace(targetRender, replaceRender);
fs.writeFileSync('src/pages/dashboard/Addresses.tsx', content);
