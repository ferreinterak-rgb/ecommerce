import React from 'react';
import { HeroSlider } from '../components/HeroSlider';
import { TrustFeaturesBar } from '../components/TrustFeaturesBar';
import { CategoryGrid } from '../components/CategoryGrid';
import { PromoBanner } from '../components/PromoBanner';
import { BestSellersGrid } from '../components/BestSellersGrid';
import { WhyChooseUsSection } from '../components/WhyChooseUsSection';

export const HomePage: React.FC = () => {
  return (
    <div className="bg-white min-h-screen">
      {/* 1. Header Hero Slider (Multi-product showcases with Spanish callouts & unique themes) */}
      <HeroSlider />

      {/* 2. Trust Features Bar */}
      <TrustFeaturesBar />

      {/* 3. Browse Categories */}
      <CategoryGrid />

      {/* 4. Special Offer Promo Banner */}
      <PromoBanner />

      {/* 5. Our Best Sellers */}
      <BestSellersGrid />

      {/* 6. Why Choose Us */}
      <WhyChooseUsSection />
    </div>
  );
};

export default HomePage;
