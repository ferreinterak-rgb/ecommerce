import React from 'react';
import { TrustFeaturesBar } from '../components/TrustFeaturesBar';
import { VideoShowcaseBanner } from '../components/VideoShowcaseBanner';
import { CategorySlider } from '../components/CategorySlider';
import { BestSellersGrid } from '../components/BestSellersGrid';
import { WhyChooseUsSection } from '../components/WhyChooseUsSection';

export const HomePage: React.FC = () => {
  return (
    <div className="bg-white min-h-screen">
      {/* 1. Trust Features Bar */}
      <TrustFeaturesBar />

      {/* 2. Banner Tipo Slider / Video Comercial de Productos */}
      <VideoShowcaseBanner />

      {/* 3. Slider Interactivo de Categorías Reales */}
      <CategorySlider />

      {/* 4. Our Best Sellers */}
      <BestSellersGrid />

      {/* 5. Why Choose Us */}
      <WhyChooseUsSection />
    </div>
  );
};

export default HomePage;
