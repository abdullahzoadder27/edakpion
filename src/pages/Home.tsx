import React, { Suspense, lazy } from 'react';
import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import { BrandLogosStrip } from '../components/home/BrandLogosStrip';
import { ShopByCategory } from '../components/home/ShopByCategory';

// Lazy load below-the-fold components
const FeaturedCollections = lazy(() => import('../components/home/FeaturedCollections').then(module => ({ default: module.FeaturedCollections })));
const NewArrivalsCarousel = lazy(() => import('../components/home/NewArrivalsCarousel').then(module => ({ default: module.NewArrivalsCarousel })));
const PromotionalBanner = lazy(() => import('../components/home/PromotionalBanner').then(module => ({ default: module.PromotionalBanner })));
const BestSellers = lazy(() => import('../components/home/BestSellers').then(module => ({ default: module.BestSellers })));
const TrendingProducts = lazy(() => import('../components/home/TrendingProducts').then(module => ({ default: module.TrendingProducts })));
const PremiumCollection = lazy(() => import('../components/home/PremiumCollection').then(module => ({ default: module.PremiumCollection })));
const LookbookSection = lazy(() => import('../components/home/LookbookSection').then(module => ({ default: module.LookbookSection })));
const FeaturedProduct = lazy(() => import('../components/home/FeaturedProduct').then(module => ({ default: module.FeaturedProduct })));
const WhyChooseUs = lazy(() => import('../components/WhyChooseUs').then(module => ({ default: module.WhyChooseUs })));
const CustomerReviews = lazy(() => import('../components/home/CustomerReviews').then(module => ({ default: module.CustomerReviews })));
const FashionJournalSection = lazy(() => import('../components/home/FashionJournalSection').then(module => ({ default: module.FashionJournalSection })));
const Newsletter = lazy(() => import('../components/Newsletter').then(module => ({ default: module.Newsletter })));
const Footer = lazy(() => import('../components/Footer').then(module => ({ default: module.Footer })));

// Loading skeleton for sections
const SectionSkeleton = () => (
  <div className="w-full h-96 flex items-center justify-center bg-gray-50/50 animate-pulse">
    <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
  </div>
);

export function Home() {
  return (
    <div className="min-h-screen font-sans antialiased bg-white text-gray-900">
      <Header />
      <main>
        <Hero />
        <BrandLogosStrip />
        <ShopByCategory />
        
        <Suspense fallback={<SectionSkeleton />}>
          <FeaturedCollections />
          <NewArrivalsCarousel />
          <PromotionalBanner />
          <BestSellers />
          <TrendingProducts />
          <PremiumCollection />
          <LookbookSection />
          <FeaturedProduct />
          <WhyChooseUs />
          <CustomerReviews />
          <FashionJournalSection />
          <Newsletter />
        </Suspense>
      </main>
      <Suspense fallback={<div className="h-64 bg-gray-900"></div>}>
        <Footer />
      </Suspense>
    </div>
  );
}
