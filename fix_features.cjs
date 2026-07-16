const fs = require('fs');

const filepath = 'src/pages/admin/AdminProductForm.tsx';
let content = fs.readFileSync(filepath, 'utf8');

// Replace features parsing in fetchProduct
content = content.replace(
  `features: { ...defaultFeatures, ...(data.features || {}) }`,
  `features: (() => {
            let parsed = { ...defaultFeatures };
            if (data.features) {
              if (Array.isArray(data.features) && data.features.length > 0) {
                try {
                  const first = data.features[0];
                  if (typeof first === 'string' && first.startsWith('{')) {
                    parsed = { ...parsed, ...JSON.parse(first) };
                  }
                } catch (e) {}
              } else if (typeof data.features === 'object' && !Array.isArray(data.features)) {
                parsed = { ...parsed, ...data.features };
              }
            }
            return parsed;
          })()`
);

// Replace features saving in handleSubmit
content = content.replace(
  `features: formData.features,`,
  `features: [JSON.stringify(formData.features)],`
);

fs.writeFileSync(filepath, content);
console.log('Fixed features in AdminProductForm.tsx');
