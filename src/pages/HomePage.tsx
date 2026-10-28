import React from 'react';
import { EditorialHeroBanner } from '../components/EditorialHeroBanner';
import { TrustFeaturesBar } from '../components/TrustFeaturesBar';
import { VideoShowcaseBanner } from '../components/VideoShowcaseBanner';
import { CategorySlider } from '../components/CategorySlider';
import { BestSellersGrid } from '../components/BestSellersGrid';
import { WhyChooseUsSection } from '../components/WhyChooseUsSection';

export const HomePage: React.FC = () => {
  return (
    <div className="bg-[#f7f7f5] min-h-screen">
      {/* 1. Hero Principal Editorial: TU NEGOCIO NECESITA UN BUEN PROVEEDOR */}
      <EditorialHeroBanner />

      {/* 2. Barra de Confianza & Valores */}
      <TrustFeaturesBar />

      {/* 3. Showcase Interactivo de Productos */}
      <VideoShowcaseBanner />

      {/* 4. Categorías Reales */}
      <CategorySlider />

      {/* 5. Catálogo de Alta Demanda / Más Vendidos */}
      <BestSellersGrid />

      {/* 6. Beneficios para Negocios y Clientes */}
      <WhyChooseUsSection />
    </div>
  );
};

export default HomePage;
