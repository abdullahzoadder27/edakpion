import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Truck, Map, Clock, AlertCircle } from 'lucide-react';

export default function Shipping() {
  return (
    <div className="w-full">
      <Helmet>
        <title>Shipping Policy | EDAKPION</title>
        <meta name="description" content="Learn about EDAKPION delivery times, shipping charges, and delivery coverage across Bangladesh." />
      </Helmet>
      
      
      <div className="pt-8 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-serif text-[#0F3D2E] mb-6 tracking-tight">Shipping Policy</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to know about our delivery process, timelines, and shipping charges.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <div className="w-12 h-12 bg-[#0F3D2E]/10 text-[#0F3D2E] rounded-full flex items-center justify-center mb-6">
                <Truck className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-[#0F3D2E] mb-3">Delivery Charges</h2>
              <ul className="space-y-3 text-gray-600">
                <li className="flex justify-between border-b border-gray-100 pb-2">
                  <span>Inside Dhaka</span>
                  <span className="font-medium text-[#0F3D2E]">৳ 80</span>
                </li>
                <li className="flex justify-between border-b border-gray-100 pb-2">
                  <span>Outside Dhaka</span>
                  <span className="font-medium text-[#0F3D2E]">৳ 150</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <div className="w-12 h-12 bg-[#0F3D2E]/10 text-[#0F3D2E] rounded-full flex items-center justify-center mb-6">
                <Clock className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-[#0F3D2E] mb-3">Estimated Delivery Time</h2>
              <ul className="space-y-3 text-gray-600">
                <li className="flex justify-between border-b border-gray-100 pb-2">
                  <span>Inside Dhaka</span>
                  <span className="font-medium text-[#0F3D2E]">2-3 Days</span>
                </li>
                <li className="flex justify-between border-b border-gray-100 pb-2">
                  <span>Outside Dhaka</span>
                  <span className="font-medium text-[#0F3D2E]">3-5 Days</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="prose prose-lg max-w-none text-gray-600 bg-white p-8 md:p-12 rounded-2xl shadow-sm">
            <h3 className="text-2xl font-serif text-[#0F3D2E] mb-4 flex items-center gap-3">
              <Map className="w-6 h-6" /> Delivery Areas
            </h3>
            <p>
              We deliver across all 64 districts in Bangladesh. We partner with reliable courier services to ensure your orders reach you safely and on time. For remote areas, delivery might take an additional 1-2 business days.
            </p>

            <h3 className="text-2xl font-serif text-[#0F3D2E] mt-10 mb-4 flex items-center gap-3">
              <Clock className="w-6 h-6" /> Order Processing
            </h3>
            <p>
              Orders placed before 2:00 PM are processed and handed over to our courier partners on the same day. Orders placed after 2:00 PM will be processed the following business day. Please note that our fulfillment center is closed on Fridays and national holidays.
            </p>

            <h3 className="text-2xl font-serif text-[#0F3D2E] mt-10 mb-4 flex items-center gap-3">
              <AlertCircle className="w-6 h-6" /> Potential Delays
            </h3>
            <p>
              While we strive to meet our delivery timelines, unexpected delays can occur due to extreme weather conditions, political unrest, or courier logistical issues. If your order is significantly delayed, our customer service team will proactively reach out to you.
            </p>

            <div className="mt-12 pt-8 border-t border-gray-100">
              <p className="font-medium text-[#0F3D2E]">
                Need help with an existing order? <Link to="/contact" className="underline hover:text-black">Contact our support team</Link>.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
