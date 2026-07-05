import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { RefreshCcw, CheckCircle, XCircle } from 'lucide-react';

export default function Returns() {
  return (
    <div className="min-h-screen bg-[#F5F2ED] font-sans flex flex-col">
      <Helmet>
        <title>Returns & Exchange Policy | EDAKPION</title>
        <meta name="description" content="Learn about EDAKPION's 7-day return and exchange policy." />
      </Helmet>
      
      <Header />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-serif text-[#0F3D2E] mb-6 tracking-tight">Returns & Exchanges</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We want you to love what you ordered. If you don't, we make returns and exchanges as simple as possible.
            </p>
          </div>

          <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm mb-12">
            <div className="flex items-start gap-4 mb-8">
              <div className="w-12 h-12 bg-[#0F3D2E]/10 text-[#0F3D2E] rounded-full flex items-center justify-center flex-shrink-0">
                <RefreshCcw className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#0F3D2E] mb-2">7-Day Policy</h2>
                <p className="text-gray-600">
                  You have 7 days from the date of delivery to request a return or exchange for your purchased items.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-10">
              <div className="bg-green-50 p-6 rounded-xl">
                <h3 className="font-bold text-green-800 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" /> Return Conditions
                </h3>
                <ul className="space-y-2 text-sm text-green-800/80 list-disc pl-5">
                  <li>Item must be unused and unwashed</li>
                  <li>Original tags must be attached</li>
                  <li>Original packaging must be intact</li>
                  <li>Proof of purchase/invoice required</li>
                </ul>
              </div>
              
              <div className="bg-red-50 p-6 rounded-xl">
                <h3 className="font-bold text-red-800 mb-4 flex items-center gap-2">
                  <XCircle className="w-5 h-5" /> Non-Returnable Items
                </h3>
                <ul className="space-y-2 text-sm text-red-800/80 list-disc pl-5">
                  <li>Items marked as 'Final Sale'</li>
                  <li>Underwear and socks</li>
                  <li>Items damaged by the customer</li>
                  <li>Items without original tags</li>
                </ul>
              </div>
            </div>

            <h3 className="text-2xl font-serif text-[#0F3D2E] mb-4">How to Request a Return/Exchange</h3>
            <div className="space-y-6 text-gray-600">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#0F3D2E] text-white flex items-center justify-center flex-shrink-0 font-bold">1</div>
                <div>
                  <h4 className="font-bold text-[#0F3D2E]">Contact Support</h4>
                  <p>Email us at support@edakpion.com or send a message via our Contact page within 7 days of delivery, mentioning your order ID and the reason for return/exchange.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#0F3D2E] text-white flex items-center justify-center flex-shrink-0 font-bold">2</div>
                <div>
                  <h4 className="font-bold text-[#0F3D2E]">Approval & Pickup</h4>
                  <p>Once approved, we will arrange a pickup via our courier partner. Please keep the item securely packed in its original packaging.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#0F3D2E] text-white flex items-center justify-center flex-shrink-0 font-bold">3</div>
                <div>
                  <h4 className="font-bold text-[#0F3D2E]">Inspection & Resolution</h4>
                  <p>After receiving the item, our quality team will inspect it. Upon successful inspection, we will dispatch your exchange item or process your refund within 3-5 business days.</p>
                </div>
              </div>
            </div>

            <h3 className="text-2xl font-serif text-[#0F3D2E] mt-10 mb-4">Damaged or Wrong Products</h3>
            <p className="text-gray-600 mb-6">
              If you receive a defective or incorrect item, please notify us within 24 hours of delivery. We will arrange a free exchange or full refund as quickly as possible.
            </p>
          </div>

          <div className="text-center">
            <Link to="/contact" className="inline-block bg-[#0F3D2E] text-white px-8 py-3 rounded-md font-medium hover:bg-[#0a291f] transition-colors">
              Initiate a Return
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
