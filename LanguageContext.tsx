import * as React from 'react';
import { translations } from './translations';

export const LanguageContext = React.createContext(undefined);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = React.useState(() => {
    const savedLang = localStorage.getItem('philfo-lang');
    if (savedLang && savedLang in translations) {
      return savedLang;
    }
    return 'en';
  });

  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem('philfo-lang', lang);
  };

  const t = (key) => {
    return translations[language][key] || translations.en[key];
  };

  const value = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = React.useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
