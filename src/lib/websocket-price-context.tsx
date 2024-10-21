import React, { createContext, useContext, useEffect, useState } from 'react';

interface PriceData {
  [key: string]: {
    price: number;
  };
}

interface PriceContextType {
  prices: PriceData;
}

const PriceContext = createContext<PriceContextType | undefined>(undefined);

export const usePrices = () => {
  const context = useContext(PriceContext);
  if (context === undefined) {
    throw new Error('usePrices must be used within a PriceProvider');
  }
  return context;
};

export const PriceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prices, setPrices] = useState<PriceData>({});

  useEffect(() => {
    const ws = new WebSocket('wss://pricefeed-production.up.railway.app/');

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setPrices((prevPrices) => ({ ...prevPrices, ...data }));
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <PriceContext.Provider value={{ prices }}>
      {children}
    </PriceContext.Provider>
  );
};