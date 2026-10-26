import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getSetting, setSetting } from '../services/database';

interface AppContextType {
  isPremium: boolean;
  setPremium: (val: boolean) => Promise<void>;
  birdCount: number;
  setBirdCount: (n: number) => void;
  incubationCount: number;
  setIncubationCount: (n: number) => void;
}

const AppContext = createContext<AppContextType>({
  isPremium: false,
  setPremium: async () => { },
  birdCount: 0,
  setBirdCount: () => { },
  incubationCount: 0,
  setIncubationCount: () => { },
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isPremium, setIsPremium] = useState(false);
  const [birdCount, setBirdCount] = useState(0);
  const [incubationCount, setIncubationCount] = useState(0);

  useEffect(() => {
    getSetting('isPremium').then(val => {
      if (val === 'true') setIsPremium(true);
    });
  }, []);

  const setPremium = useCallback(async (val: boolean) => {
    setIsPremium(val);
    await setSetting('isPremium', val ? 'true' : 'false');
  }, []);

  return (
    <AppContext.Provider value={{
      isPremium, setPremium,
      birdCount, setBirdCount,
      incubationCount, setIncubationCount,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
