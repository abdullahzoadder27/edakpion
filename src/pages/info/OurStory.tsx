import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

export default function OurStory() {
  return (
    <div className="min-h-screen bg-[#F5F2ED] font-sans flex flex-col">
      <Helmet>
        <title>Our Story | EDAKPION</title>
        <meta name="description" content="Discover the story behind EDAKPION and our mission to bring premium clothing across Bangladesh." />
      </Helmet>
      
      <Header />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-serif text-[#0F3D2E] mb-6 tracking-tight">Our Story</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From a vision to reality, the journey of EDAKPION in redefining premium fashion.
            </p>
          </div>

          <div className="prose prose-lg max-w-none text-gray-600 space-y-8 mb-16">
            <p>
              EDAKPION started with a clear realization: there was a gap in the market for truly premium, thoughtfully designed everyday wear in Bangladesh. We noticed that consumers were often forced to choose between affordability and quality. We wanted to offer both.
            </p>
            
            <p>
              Our journey began with months of research, sourcing the best fabrics, testing fits, and refining designs. We wanted to create pieces that we would love to wear ourselves—garments that feel as good as they look.
            </p>

            <h3 className="text-2xl font-serif text-[#0F3D2E] mt-12 mb-4">Focus on Quality</h3>
            <p>
              Every stitch, every seam, and every fabric choice at EDAKPION is deliberate. We partner with skilled artisans and top-tier manufacturers to ensure that our clothing meets the highest standards of craftsmanship. From our signature oversized t-shirts to our premium outerwear, we never compromise on quality.
            </p>

            <h3 className="text-2xl font-serif text-[#0F3D2E] mt-12 mb-4">Looking Forward</h3>
            <p>
              Today, EDAKPION is growing into a beloved brand across Bangladesh, known for our commitment to excellence and exceptional customer service. As we continue to expand our collections, our core philosophy remains unchanged: to provide timeless, premium fashion that empowers you.
            </p>
          </div>

          <div className="bg-[#0F3D2E] text-white rounded-2xl p-10 md:p-16 text-center">
            <h2 className="text-3xl font-serif mb-6">Join Our Journey</h2>
            <p className="mb-8 text-gray-300 max-w-xl mx-auto">Experience the difference of true premium quality. Upgrade your wardrobe with our latest arrivals.</p>
            <Link to="/shop" className="inline-block bg-white text-[#0F3D2E] px-8 py-4 rounded-md font-medium hover:bg-gray-100 transition-colors">
              Shop The Collection
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
