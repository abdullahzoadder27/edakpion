import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { supabase } from '../../lib/supabase';
import { z } from 'zod';

const contactSchema = z.object({
  full_name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  subject: z.string().min(2, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters long")
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function Contact() {
  const [formData, setFormData] = useState<ContactFormData>({
    full_name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when typing
    if (errors[name as keyof ContactFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess(false);

    try {
      // Validate form
      contactSchema.parse(formData);
      setIsSubmitting(true);

      const { error } = await supabase
        .from('contact_messages')
        .insert([formData]);

      if (error) throw error;
      
      setSubmitSuccess(true);
      setFormData({ full_name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof ContactFormData, string>> = {};
        const zodErr = err as any;
        zodErr.errors.forEach((e: any) => {
          if (e.path[0]) {
            newErrors[e.path[0] as keyof ContactFormData] = e.message;
          }
        });
        setErrors(newErrors);
      } else {
        setSubmitError('Failed to send message. Please try again later.');
        // console.error(err);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F2ED] font-sans flex flex-col">
      <Helmet>
        <title>Contact Us | EDAKPION</title>
        <meta name="description" content="Contact EDAKPION for orders, support, shipping, returns, and general questions." />
      </Helmet>
      
      <Header />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-serif text-[#0F3D2E] mb-6 tracking-tight">Contact Us</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're here to help. Reach out to us for any questions regarding your order, our products, or general inquiries.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-1 space-y-8">
              <div className="bg-white p-8 rounded-2xl shadow-sm">
                <div className="w-12 h-12 bg-[#0F3D2E]/10 text-[#0F3D2E] rounded-full flex items-center justify-center mb-6">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#0F3D2E] mb-2">Email Us</h3>
                <p className="text-gray-600 mb-4">Our friendly team is here to help.</p>
                <a href="mailto:support@edakpion.com" className="font-medium text-[#0F3D2E] hover:underline">
                  support@edakpion.com
                </a>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm">
                <div className="w-12 h-12 bg-[#0F3D2E]/10 text-[#0F3D2E] rounded-full flex items-center justify-center mb-6">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#0F3D2E] mb-2">Visit Us</h3>
                <p className="text-gray-600 mb-4">Come say hello at our headquarters.</p>
                <p className="font-medium text-[#0F3D2E]">
                  Dhaka, Bangladesh
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm">
                <div className="w-12 h-12 bg-[#0F3D2E]/10 text-[#0F3D2E] rounded-full flex items-center justify-center mb-6">
                  <Phone className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#0F3D2E] mb-2">Call Us</h3>
                <p className="text-gray-600 mb-4">Mon-Sat from 10am to 8pm.</p>
                <a href="tel:+8801234567890" className="font-medium text-[#0F3D2E] hover:underline">
                  +880 1234 567 890
                </a>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm">
                <h2 className="text-2xl font-serif text-[#0F3D2E] mb-8">Send us a message</h2>
                
                {submitSuccess ? (
                  <div className="bg-green-50 text-green-800 p-6 rounded-xl text-center">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Send className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
                    <p>Thank you for reaching out. Our team will get back to you shortly.</p>
                    <button 
                      onClick={() => setSubmitSuccess(false)}
                      className="mt-6 text-[#0F3D2E] font-medium hover:underline"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {submitError && (
                      <div className="bg-red-50 text-red-600 p-4 rounded-md text-sm">
                        {submitError}
                      </div>
                    )}
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                        <input
                          type="text"
                          id="full_name"
                          name="full_name"
                          value={formData.full_name}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#0F3D2E] focus:border-transparent outline-none transition-all"
                          placeholder="John Doe"
                        />
                        {errors.full_name && <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>}
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#0F3D2E] focus:border-transparent outline-none transition-all"
                          placeholder="john@example.com"
                        />
                        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">Phone (Optional)</label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#0F3D2E] focus:border-transparent outline-none transition-all"
                          placeholder="+880 1..."
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                        <input
                          type="text"
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#0F3D2E] focus:border-transparent outline-none transition-all"
                          placeholder="How can we help?"
                        />
                        {errors.subject && <p className="mt-1 text-sm text-red-600">{errors.subject}</p>}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                      <textarea
                        id="message"
                        name="message"
                        rows={5}
                        value={formData.message}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#0F3D2E] focus:border-transparent outline-none transition-all resize-none"
                        placeholder="Write your message here..."
                      ></textarea>
                      {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#0F3D2E] text-white py-4 rounded-md font-medium hover:bg-[#0a291f] transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
