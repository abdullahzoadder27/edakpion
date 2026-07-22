const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminProductForm.tsx', 'utf8');

const regex = /\/\* Image Management \*\/[\s\S]*?const removeImage = \(index: number\) => \{\s*setImages\(images\.filter\(\(_, i\) => i !== index\)\);\s*\};/g;

const newCode = `// Image Management
  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      setImages(prev => {
        const newImages = [...prev];
        const temp = newImages[index];
        newImages[index] = newImages[index - 1];
        newImages[index - 1] = temp;
        return newImages;
      });
    } else if (direction === 'down' && index < images.length - 1) {
      setImages(prev => {
        const newImages = [...prev];
        const temp = newImages[index];
        newImages[index] = newImages[index + 1];
        newImages[index + 1] = temp;
        return newImages;
      });
    }
  };`;

code = code.replace(regex, newCode);
// also remove handleImageUpload completely. 
const oldUploadRegex = /\/\/ Image Management[\s\S]*?const handleImageUpload = async \(e: React\.ChangeEvent<HTMLInputElement>\) => \{[\s\S]*?\}\s*};\s*const removeImage/m;
code = code.replace(oldUploadRegex, newCode);

fs.writeFileSync('src/pages/admin/AdminProductForm.tsx', code);
console.log('Functions updated');
