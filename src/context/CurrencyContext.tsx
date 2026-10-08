import React, { createContext, useContext, useState } from 'react';

export type CurrencyCode = 'COP' | 'USD' | 'MXN' | 'EUR';

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  formatPrice: (amountInCOP: number) => string;
}

const EXCHANGE_RATES: Record<CurrencyCode, { rateFromCOP: number; symbol: string; locale: string }> = {
  COP: { rateFromCOP: 1, symbol: '$', locale: 'es-CO' },
  USD: { rateFromCOP: 1 / 3950, symbol: '$', locale: 'en-US' },
  MXN: { rateFromCOP: 17.5 / 3950, symbol: '$', locale: 'es-MX' },
  EUR: { rateFromCOP: 0.92 / 3950, symbol: '€', locale: 'de-DE' },
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<CurrencyCode>('COP');

  const formatPrice = (amountInCOP: number): string => {
    if (!amountInCOP || isNaN(amountInCOP)) amountInCOP = 0;

    if (currency === 'COP') {
      const roundedCOP = Math.round(amountInCOP);
      return `$ ${roundedCOP.toLocaleString('es-CO')} COP`;
    }

    const config = EXCHANGE_RATES[currency] || EXCHANGE_RATES.COP;
    const converted = amountInCOP * config.rateFromCOP;

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
