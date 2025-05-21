import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

export const I18nContext = createContext();

export function I18nProvider({ children }) {
  const STORAGE_LANG_KEY = 'promont_lang_code';
  const STORAGE_TRANSLATIONS_KEY = 'promont_translations';

  const [lang, setLang] = useState(localStorage.getItem(STORAGE_LANG_KEY) || 'en');
  const [translations, setTranslations] = useState({});

  const loadTranslations = () => {
    axios.get('/api/translations/')
      .then((res) => {
        console.log('✅ Reloaded translations:', res.data);
        const map = {};
        res.data.forEach(item => {
          map[item.key] = {
            en: item.en,
            ru: item.ru,
            uz: item.uz,
          };
        });
        setTranslations(map);
        localStorage.setItem(STORAGE_TRANSLATIONS_KEY, JSON.stringify(map));
      })
      .catch((err) => {
        console.error('❌ Error reloading translations:', err);
      });
  };

  useEffect(() => {
    const cached = localStorage.getItem(STORAGE_TRANSLATIONS_KEY);
    if (cached && cached !== '{}') {
      setTranslations(JSON.parse(cached));
    } else {
      loadTranslations();  // initial load
    }
  }, []);

  const changeLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem(STORAGE_LANG_KEY, newLang);
  };

  const returnTitle = (key) => {
    const entry = translations[key];
    if (!entry) return key;

    const localized = entry[lang];
    return localized || entry.en || key;
  };

  return (
    <I18nContext.Provider value={{ lang, changeLanguage, returnTitle, reloadTranslations: loadTranslations }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = () => useContext(I18nContext);
