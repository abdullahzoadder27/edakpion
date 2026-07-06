const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

const fetchLogic = `
  const [content, setContent] = useState<any>(null);

  useEffect(() => {
    getProducts().then(setProducts);
    getPublishedBlogs(3).then(setBlogs);
    
    supabase.from('store_settings').select('value').eq('key', 'homepage_cms').single()
      .then(({ data }) => {
        if (data && data.value) setContent(data.value);
      });
  }, []);
`;
code = code.replace(/useEffect\(\(\) => \{\s+getProducts\(\)\.then\(setProducts\);\s+getPublishedBlogs\(3\)\.then\(setBlogs\);\s+\}, \[\]\);/, fetchLogic);

code = code.replace(/{'\*'}/g, ''); // Fix escaping

fs.writeFileSync('src/pages/Home.tsx', code);
