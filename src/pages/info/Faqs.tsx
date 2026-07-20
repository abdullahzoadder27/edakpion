import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { getBaseOrganization, getBaseWebSite, getBreadcrumbList, getFAQPageSchema } from '../../lib/schema';

import { ChevronDown, ChevronUp } from 'lucide-react';

const faqData = [
  {
    question: "How can I place an order?",
    answer: "You can place an order directly through our website. Browse our shop, select your desired items, choose the correct size and color, add them to your cart, and proceed to checkout."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept secure payments via bKash, Nagad, Mastercard, VISA, and Cash on Delivery (COD) for eligible areas."
  },
  {
    question: "Do you offer Cash on Delivery?",
    answer: "Yes, we offer Cash on Delivery (COD) across Bangladesh. Please note that a partial advance payment might be required for certain orders."
  },
  {
    question: "How long does delivery take?",
    answer: "Standard delivery inside Dhaka takes 2-3 business days. Outside Dhaka, delivery usually takes 3-5 business days depending on the courier service."
  },
  {
    question: "Can I return or exchange a product?",
    answer: "Yes, we have a 7-day return and exchange policy. Items must be unworn, unwashed, and have original tags attached. Please visit our Return Policy page for more details."
  },
  {
    question: "How do I choose the right size?",
    answer: "We provide a detailed Size Guide on every product page. We recommend comparing these measurements with a similar item of clothing you already own that fits you well."
  },
  {
    question: "How can I track my order?",
    answer: "Once your order is dispatched, you will receive a tracking link via email or SMS. You can also track your order from your account dashboard."
  },
  {
    question: "How do I contact support?",
    answer: "You can reach our customer support team via the Contact Us page, email us at support@edakpion.com, or call us at our listed phone numbers during business hours."
  }
];

export default function Faqs() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full">
      <Helmet>
        <title>FAQs | EDAKPION</title>
        <meta name="description" content="Find answers to common questions about ordering, payment, shipping, returns, and sizing." />
      
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              getBaseOrganization(),
              getBaseWebSite(),
              getBreadcrumbList([
                { name: "Home", url: "/" },
                { name: "FAQs", url: "/faqs" }
              ]),
              getFAQPageSchema(faqData)
            ]
          }) }} />
      </Helmet>
      
      
      <div className="pt-8 pb-16">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-serif text-[#0F3D2E] mb-6 tracking-tight">Frequently Asked Questions</h1>
            <p className="text-lg text-gray-600">
              Find answers to the most commonly asked questions below.
            </p>
          </div>

          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <div 
                key={index} 
                className={`bg-white rounded-xl overflow-hidden transition-all duration-200 ${
                  openIndex === index ? 'shadow-md border border-[#0F3D2E]/20' : 'shadow-sm border border-transparent'
                }`}
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                  aria-expanded={openIndex === index}
                >
                  <span className="font-bold text-[#0F3D2E] pr-4">{faq.question}</span>
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-[#0F3D2E] flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                
                <div 
                  className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                    openIndex === index ? 'max-h-96 pb-5 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center bg-white p-8 rounded-2xl shadow-sm">
            <h2 className="text-2xl font-serif text-[#0F3D2E] mb-4">Still have questions?</h2>
            <p className="text-gray-600 mb-6">If you couldn't find the answer you're looking for, feel free to contact our support team.</p>
            <a href="/contact" className="inline-block bg-[#0F3D2E] text-white px-8 py-3 rounded-md font-medium hover:bg-[#0a291f] transition-colors">
              Contact Support
            </a>
          </div>
        </div>
      </div>

    </div>
  );
}
