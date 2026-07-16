const fs = require('fs');
const filepath = 'src/pages/admin/AdminProductForm.tsx';
let content = fs.readFileSync(filepath, 'utf8');

const regex = /const handleSubmit = async \(e: React\.FormEvent\) => \{[\s\S]*?finally \{\s*setLoading\(false\);\s*window\.scrollTo\(\{ top: 0, behavior: 'smooth' \}\);\s*\}\s*\};/m;

const newHandleSubmit = `const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (!formData.name) throw new Error('Product name is required.');
      if (!formData.price) throw new Error('Price is required.');
      if (!formData.category_id) throw new Error('Category is required.');
      if (images.length === 0) throw new Error('At least one image is required.');

      const payload = {
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: formData.description,
        price: parseFloat(formData.price) || 0,
        compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null,
        category_id: formData.category_id || null,
        stock: parseInt(formData.stock) || 0,
        is_active: formData.is_active,
        seo_title: formData.seo_title,
        seo_description: formData.seo_description,
        sku: formData.sku || \`EDK-\${Math.floor(1000 + Math.random() * 9000)}\`,
        status: formData.status,
        features: [JSON.stringify(formData.features)],
        images: images.filter(url => url.trim() !== ''),
        sizes: sizes.filter(s => s.trim() !== ''),
        colors: colors.filter(c => c.trim() !== ''),
        tags: tags.filter(t => t.trim() !== ''),
        updated_at: new Date().toISOString()
      };

      console.log("Payload:", payload);

      if (id) {
        const response = await supabase.from('products').update(payload).eq('id', id);
        console.log("Update Response:", response);
        const { error } = response;
        if (error) {
          console.error("Supabase Error:", error);
          if (error.code === '23505') throw new Error('A product with this slug already exists.');
          if (error.code === '22P02') throw new Error('Invalid data format submitted.');
          if (error.code === '42501') throw new Error('Permission denied. Ensure you are an admin.');
          throw new Error('Database constraint violation or update failed.');
        }
        setSuccessMsg('Product updated successfully!');
      } else {
        const response = await supabase.from('products').insert([{ ...payload, created_at: new Date().toISOString() }]);
        console.log("Insert Response:", response);
        const { error } = response;
        if (error) {
          console.error("Supabase Error:", error);
          if (error.code === '23505') throw new Error('A product with this slug already exists.');
          if (error.code === '22P02') throw new Error('Invalid data format submitted.');
          if (error.code === '42501') throw new Error('Permission denied. Ensure you are an admin.');
          throw new Error('Database constraint violation or insert failed.');
        }
        setSuccessMsg('Product created successfully!');
        navigate('/admin/products');
      }
    } catch (err: any) {
      console.error("Save Error:", err);
      let errMsg = err.message || 'An error occurred while saving the product.';
      if (errMsg.includes('JSON')) errMsg = 'Invalid data format or missing required fields.';
      setErrorMsg(errMsg);
    } finally {
      setLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };`;

content = content.replace(regex, newHandleSubmit);
fs.writeFileSync(filepath, content);
console.log("Updated handleSubmit");
