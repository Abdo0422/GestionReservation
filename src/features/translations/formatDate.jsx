import dayjs from "dayjs";
import "dayjs/locale/fr";  
import "dayjs/locale/ar";  
import { useLanguage } from "./LanguageContext";  

export const formatDate = (dateString) => {
  const { language } = useLanguage();  

  const localizedDayjs = dayjs(dateString).locale(language);  
  const formats = {
    fr: "D MMM YYYY", 
    ar: "D MMM YYYY", 
  };

  const format = formats[language] || formats.fr; 

  return localizedDayjs.format(format);
};
