import { Helmet } from 'react-helmet-async';
import { getBaseOrganization, getBaseWebSite, getBreadcrumbList, getAboutPageSchema } from '../../lib/schema';

import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="w-full">
      <Helmet>
        <title>About EDAKPION | Premium Men's Clothing</title>
        <meta name="description" content="Learn about EDAKPION, a premium men's clothing brand in Bangladesh focused on timeless style and unmatched quality." />
      
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              getBaseOrganization(),
              getBaseWebSite(),
              getBreadcrumbList([
                { name: "Home", url: "/" },
                { name: "About", url: "/about" }
              ]),
              getAboutPageSchema()
            ]
          }) }} />
      </Helmet>
      
      
      <div className="pt-8 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-serif text-[#0F3D2E] mb-6 tracking-tight">About EDAKPION</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We are a premium clothing brand focused on delivering timeless style, unmatched quality, and ultimate comfort to fashion-conscious individuals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div className="aspect-square bg-[#0F3D2E] rounded-xl overflow-hidden flex items-center justify-center text-[#F5F2ED]/50 font-serif text-3xl">
              EDAKPION
            </div>
            <div>
              <h2 className="text-2xl font-serif text-[#0F3D2E] mb-4">Who We Are</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                EDAKPION was born from a simple idea: premium clothing shouldn't be complicated. We believe in creating pieces that become the foundation of your wardrobe—items you reach for again and again. Our focus is on sourcing the finest fabrics and employing meticulous craftsmanship.
              </p>
              <h2 className="text-2xl font-serif text-[#0F3D2E] mb-4">Our Mission</h2>
              <p className="text-gray-600 leading-relaxed">
                To elevate everyday fashion in Bangladesh by providing world-class, premium apparel that inspires confidence and stands the test of time.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-10 md:p-16 text-center shadow-sm mb-16">
            <h2 className="text-3xl font-serif text-[#0F3D2E] mb-6">Why Choose Us</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-bold text-[#0F3D2E] mb-2">Premium Fabric</h3>
                <p className="text-gray-600 text-sm">We source only the highest quality materials for exceptional comfort and durability.</p>
              </div>
              <div>
                <h3 className="font-bold text-[#0F3D2E] mb-2">Timeless Design</h3>
                <p className="text-gray-600 text-sm">Our pieces are designed to outlast passing trends, offering enduring style.</p>
              </div>
              <div>
                <h3 className="font-bold text-[#0F3D2E] mb-2">Unmatched Comfort</h3>
                <p className="text-gray-600 text-sm">Every garment is tailored for the perfect fit and all-day wearability.</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link to="/shop" className="inline-block bg-[#0F3D2E] text-white px-8 py-4 rounded-md font-medium hover:bg-[#0a291f] transition-colors">
              Explore Our Collection
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
