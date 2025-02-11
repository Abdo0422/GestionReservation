import React from "react";
import { useLanguage } from "../features/translation/LanguageContext";
import { translations } from "../features/translation/translations";

const Translate = ({ textKey }) => {
  const { language } = useLanguage();

  return <span>{translations[language][textKey]}</span>;
};

export default Translate;
