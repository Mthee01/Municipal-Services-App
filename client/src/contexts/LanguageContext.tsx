import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation, supportedLanguages } from '@/lib/translations';

interface LanguageContextType {
  language: string;
  setLanguage: (language: string) => void;
  t: any;
  supportedLanguages: typeof supportedLanguages;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState(() => {
    try {
      // Check localStorage first, then browser language, fallback to English
      const savedLanguage = localStorage.getItem('municipalLanguage');
      if (savedLanguage && supportedLanguages.some(lang => lang.code === savedLanguage)) {
        return savedLanguage;
      }
      
      // Check browser language
      const browserLang = navigator.language.split('-')[0];
      if (supportedLanguages.some(lang => lang.code === browserLang)) {
        return browserLang;
      }
    } catch (error) {
      console.warn('Error accessing localStorage:', error);
    }
    
    return 'en';
  });

  const { t } = useTranslation(language);

  const setLanguage = (newLanguage: string) => {
    setLanguageState(newLanguage);
    localStorage.setItem('municipalLanguage', newLanguage);
  };

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage,
      t,
      supportedLanguages
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}