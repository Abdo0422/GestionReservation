import React from "react";
import { useLanguage } from "../features/translations/LanguageContext";
import { translations } from "../features/translations/translations";

const Translate = ({ textKey, values = {} }) => {
  const { language, arabicTextStyle } = useLanguage();
  let translatedText = translations[language][textKey];

  if (values) {
    Object.keys(values).forEach((key) => {
      const regex = new RegExp(`\\{${key}\\}`, "g"); 
      translatedText = translatedText.replace(regex, values[key]);
    });
  }

  return <span style={arabicTextStyle}>{translatedText}</span>;
};

export default Translate;
