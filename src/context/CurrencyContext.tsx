import React, { createContext, useContext, useState } from 'react';

export type CurrencyCode = 'COP' | 'USD' | 'MXN' | 'EUR';

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  formatPrice: (amountInUSD: number) => string;
}

const EXCHANGE_RATES: Record<CurrencyCode, { rate: number; symbol: string; locale: string }> = {
  COP: { rate: 3950, symbol: '$', locale: 'es-CO' },
  USD: { rate: 1, symbol: '$', locale: 'en-US' },
  MXN: { rate: 17.5, symbol: '$', locale: 'es-MX' },
  EUR: { rate: 0.92, symbol: '€', locale: 'de-DE' },
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<CurrencyCode>('COP');

  const formatPrice = (amountInUSD: number): string => {
    const config = EXCHANGE_RATES[currency] || EXCHANGE_RATES.COP;
    const converted = amountInUSD * config.rate;

    if (currency === 'COP') {
      // Round to thousands for clean realistic Colombian hardware prices e.g. $ 789.900 COP
      const roundedCOP = Math.round(converted / 100) * 100;
      return `$ ${roundedCOP.toLocaleString('es-CO')} COP`;
    }

    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(converted);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
