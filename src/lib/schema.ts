export const SITE_URL = 'https://edakpion.com';
export const BRAND_NAME = 'EDAKPION';

export const getBaseOrganization = () => ({
  "@type": ["Organization", "Brand", "ClothingBrand"],
  "@id": `${SITE_URL}/#organization`,
  "name": BRAND_NAME,
  "url": SITE_URL,
  "logo": {
    "@type": "ImageObject",
    "@id": `${SITE_URL}/#logo`,
    "inLanguage": "en-BD",
    "url": `${SITE_URL}/logo.png`,
    "contentUrl": `${SITE_URL}/logo.png`,
    "width": 512,
    "height": 512,
    "caption": `${BRAND_NAME} Logo`
  },
  "image": {
    "@id": `${SITE_URL}/#logo`
  },
  "description": "Premium Men's Clothing Online in Bangladesh",
  "sameAs": [
    "https://www.facebook.com/edakpion",
    "https://www.instagram.com/edakpion"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+880-1234-567890",
    "contactType": "customer service",
    "areaServed": "BD",
    "availableLanguage": ["English", "Bengali"]
  }
});

export const getBaseWebSite = () => ({
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  "url": SITE_URL,
  "name": BRAND_NAME,
  "description": "Premium Men's Clothing Online in Bangladesh",
  "publisher": {
    "@id": `${SITE_URL}/#organization`
  },
  "inLanguage": "en-BD",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": `${SITE_URL}/shop?q={search_term_string}`
    },
    "query-input": "required name=search_term_string"
  }
});

export const getBreadcrumbList = (items: { name: string; url?: string }[]) => ({
  "@type": "BreadcrumbList",
  "@id": `${SITE_URL}/#breadcrumb`,
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url ? `${SITE_URL}${item.url}` : undefined
  }))
});

export const getMerchantReturnPolicy = () => ({
  "@type": "MerchantReturnPolicy",
  "@id": `${SITE_URL}/returns#policy`,
  "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
  "merchantReturnDays": 7,
  "returnMethod": "https://schema.org/ReturnByMail",
  "returnFees": "https://schema.org/ReturnFeesCustomerResponsibility",
  "itemCondition": "https://schema.org/NewCondition"
});

export const getProductSchema = (product: any, reviews: any[] = []) => {
  const url = `${SITE_URL}/product/${product.id}`;
  
  const offers: any = {
    "@type": "Offer",
    "url": url,
    "priceCurrency": "BDT",
    "price": product.price,
    "availability": product.stock_quantity > 0 
      ? "https://schema.org/InStock" 
      : "https://schema.org/OutOfStock",
    "itemCondition": "https://schema.org/NewCondition",
    "seller": {
      "@id": `${SITE_URL}/#organization`
    },
    "hasMerchantReturnPolicy": getMerchantReturnPolicy()
  };

  const schema: any = {
    "@type": "Product",
    "@id": `${url}/#product`,
    "name": product.name,
    "description": product.description || `Buy ${product.name} at EDAKPION.`,
    "image": product.images && product.images.length > 0 
      ? product.images.map((img: string) => ({
          "@type": "ImageObject",
          "url": img,
          "width": 800,
          "height": 800
        }))
      : [`${SITE_URL}/placeholder-product.jpg`],
    "sku": product.id,
    "brand": {
      "@id": `${SITE_URL}/#organization`
    },
    "offers": offers,
    "url": url
  };

  if (reviews && reviews.length > 0) {
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    schema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": avgRating.toFixed(1),
      "reviewCount": reviews.length,
      "bestRating": 5,
      "worstRating": 1
    };
    
    schema.review = reviews.map(r => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": r.user_name || "Verified Customer"
      },
      "datePublished": r.created_at,
      "reviewBody": r.comment,
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": r.rating,
        "bestRating": 5,
        "worstRating": 1
      }
    }));
  }

  return schema;
};

export const getCollectionSchema = (url: string, title: string, description: string, products: any[]) => ({
  "@type": "CollectionPage",
  "@id": `${SITE_URL}${url}/#webpage`,
  "url": `${SITE_URL}${url}`,
  "name": title,
  "description": description,
  "isPartOf": {
    "@id": `${SITE_URL}/#website`
  },
  "mainEntity": {
    "@type": "ItemList",
    "itemListElement": products.map((product, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `${SITE_URL}/product/${product.id}`
    }))
  }
});

export const getAboutPageSchema = () => ({
  "@type": "AboutPage",
  "@id": `${SITE_URL}/about/#webpage`,
  "url": `${SITE_URL}/about`,
  "name": "About EDAKPION | Premium Men's Clothing Online in Bangladesh",
  "description": "Learn about EDAKPION, a premium men's fashion & clothing brand in Bangladesh offering timeless shirts, polos, panjabis, hoodies and modern essentials.",
  "isPartOf": {
    "@id": `${SITE_URL}/#website`
  },
  "mainEntity": {
    "@id": `${SITE_URL}/#organization`
  }
});

export const getContactPageSchema = () => ({
  "@type": "ContactPage",
  "@id": `${SITE_URL}/contact/#webpage`,
  "url": `${SITE_URL}/contact`,
  "name": "Contact EDAKPION | Premium Men's Clothing Online in Bangladesh",
  "description": "Contact EDAKPION for support, inquiries, and assistance regarding our premium men's clothing in Bangladesh.",
  "isPartOf": {
    "@id": `${SITE_URL}/#website`
  },
  "mainEntity": {
    "@id": `${SITE_URL}/#organization`
  }
});

export const getFAQPageSchema = (faqs: { question: string; answer: string }[]) => ({
  "@type": "FAQPage",
  "@id": `${SITE_URL}/faqs/#webpage`,
  "url": `${SITE_URL}/faqs`,
  "name": "FAQs | EDAKPION",
  "isPartOf": {
    "@id": `${SITE_URL}/#website`
  },
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});

export const getBlogSchema = (url: string, title: string, description: string, blogs: any[]) => ({
  "@type": "Blog",
  "@id": `${SITE_URL}${url}/#blog`,
  "url": `${SITE_URL}${url}`,
  "name": title,
  "description": description,
  "publisher": {
    "@id": `${SITE_URL}/#organization`
  },
  "blogPost": blogs.map(blog => ({
    "@type": "BlogPosting",
    "headline": blog.title,
    "url": `${SITE_URL}/blog/${blog.id}`
  }))
});

export const getBlogPostingSchema = (blog: any) => {
  const url = `${SITE_URL}/blog/${blog.id}`;
  return {
    "@type": "BlogPosting",
    "@id": `${url}/#blogposting`,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
    },
    "headline": blog.title,
    "description": blog.excerpt || blog.title,
    "image": blog.image_url ? {
      "@type": "ImageObject",
      "url": blog.image_url,
      "width": 1200,
      "height": 630
    } : undefined,
    "datePublished": blog.created_at,
    "dateModified": blog.updated_at || blog.created_at,
    "author": {
      "@type": "Person",
      "name": blog.author?.full_name || BRAND_NAME,
      "url": SITE_URL
    },
    "publisher": {
      "@id": `${SITE_URL}/#organization`
    }
  };
};

