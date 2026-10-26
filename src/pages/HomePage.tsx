import React from 'react';
import { TrustFeaturesBar } from '../components/TrustFeaturesBar';
import { CategorySlider } from '../components/CategorySlider';
import { BestSellersGrid } from '../components/BestSellersGrid';
import { WhyChooseUsSection } from '../components/WhyChooseUsSection';

export const HomePage: React.FC = () => {
  return (
    <div className="bg-white min-h-screen">
      {/* 1. Trust Features Bar */}
      <TrustFeaturesBar />

      {/* 2. Slider Interactivo de Categorías Reales */}
      <CategorySlider />

      {/* 3. Our Best Sellers */}
      <BestSellersGrid />

      {/* 4. Why Choose Us */}
      <WhyChooseUsSection />
    </div>
  );
};

export default HomePage;
