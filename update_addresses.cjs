const fs = require('fs');
let content = fs.readFileSync('src/pages/dashboard/Addresses.tsx', 'utf8');

const target = `      const addressData = {
        user_id: user.id,
        title,
        full_name: fullName,
        phone,
        address_line1: addressLine1,
        address_line2: addressLine2,
        city,
        state,
        postal_code: postalCode,
        country,
        is_default: addresses.length === 0 ? true : isDefault, // Force default if it's the first address
      };`;

const replacement = `      const addressData = {
        user_id: user.id,
        full_name: fullName,
        phone_number: phone,
        street_address: addressLine1 + (addressLine2 ? \`, \${addressLine2}\` : '') + (postalCode ? \` (\${postalCode})\` : '') + (country !== 'Bangladesh' ? \` - \${country}\` : ''),
        area: title || city,
        district: state || city,
        is_default: addresses.length === 0 ? true : isDefault,
      };`;

content = content.replace(target, replacement);

const target2 = `    setTitle(addr.title || '');
    setFullName(addr.full_name || '');
    setPhone(addr.phone || '');
    setAddressLine1(addr.address_line1 || '');
    setAddressLine2(addr.address_line2 || '');
    setCity(addr.city || '');
    setState(addr.state || '');
    setPostalCode(addr.postal_code || '');`;

const replacement2 = `    setTitle(addr.area || '');
    setFullName(addr.full_name || '');
    setPhone(addr.phone_number || '');
    setAddressLine1(addr.street_address || '');
    setAddressLine2('');
    setCity(addr.district || '');
    setState('');
    setPostalCode('');`;

content = content.replace(target2, replacement2);

fs.writeFileSync('src/pages/dashboard/Addresses.tsx', content);
console.log("Updated Addresses.tsx");
