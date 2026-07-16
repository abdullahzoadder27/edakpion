const fs = require('fs');

const filepath = 'src/components/ProductReviews.tsx';
let content = fs.readFileSync(filepath, 'utf8');

const regex = /const fetchReviews = async \(\) => \{[\s\S]*?catch \(err\) \{[\s\S]*?\}\s*\};/m;

const replacement = `const fetchReviews = async () => {
    try {
      // Fetch admin-created reviews
      const { data: adminData, error: adminError } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('status', 'Published');
        
      // Fetch user-created reviews
      const { data: userData, error: userError } = await supabase
        .from('reviews')
        .select('*, profiles(full_name, avatar_url)')
        .eq('product_id', productId)
        .eq('status', 'approved');

      if (adminError) console.error("Admin reviews error:", adminError);
      if (userError) console.error("User reviews error:", userError);

      let allReviews: any[] = [];
      
      if (adminData) {
        allReviews = [...adminData];
      }
      
      if (userData) {
        const mappedUserReviews = userData.map((r: any) => ({
          id: r.id,
          product_id: r.product_id,
          customer_name: r.profiles?.full_name || 'Verified Customer',
          review_text: r.review_text,
          rating: r.rating || 5,
          verified_buyer: !!r.order_id,
          customer_location: '',
          customer_designation: 'Customer',
          profile_image: r.profiles?.avatar_url || r.review_image_url || '',
          review_date: r.created_at,
          helpful_count: 0,
          status: 'Published',
          sort_order: 0,
          admin_reply: r.admin_reply || '',
          created_at: r.created_at,
          updated_at: r.updated_at
        }));
        allReviews = [...allReviews, ...mappedUserReviews];
      }

      setReviews(allReviews);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };`;

content = content.replace(regex, replacement);
fs.writeFileSync(filepath, content);
console.log('Fixed ProductReviews.tsx merge');
