import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationFR from '../locales/fr.json';
import translationAR from '../locales/ar.json';

const resources = {
  fr: {
    translation: translationFR,
  },
  ar: {
    translation: translationAR,
  },
};

// Get saved language from localStorage or use default
const getSavedLanguage = (): string => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('language');
    if (saved && ['fr', 'ar'].includes(saved)) {
      return saved;
    }
  }
  return 'fr'; // Default language
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getSavedLanguage(),
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false, // React already escapes
    },
    react: {
      useSuspense: false,
    },
  });

// Save language preference when changed
i18n.on('languageChanged', (lng) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('language', lng);
    // Update document direction for RTL support
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lng;
  }
});

export default i18n;
