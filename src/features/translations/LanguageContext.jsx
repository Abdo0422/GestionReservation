import React, { createContext, useState, useContext, useEffect } from "react";

const LanguageContext = createContext();
export const useLanguage = () => {
  return useContext(LanguageContext);
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'fr');

  useEffect(() => {
    localStorage.setItem('language', language);
    document.body.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
  };

  const arabicTextStyle = language === "ar" ? { 
    fontFamily: 'Noto Sans Arabic, sans-serif',
    textAligment: 'right',
  } : {};
  
  return (
    <LanguageContext.Provider value={{ language, changeLanguage, arabicTextStyle }}>
      {children}
    </LanguageContext.Provider>
  );
};
