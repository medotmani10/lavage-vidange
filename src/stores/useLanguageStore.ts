import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Language = 'fr' | 'ar';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  isRTL: boolean;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'fr',
      setLanguage: (lang) => {
        set({ language: lang, isRTL: lang === 'ar' });
        // Update HTML attributes
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = lang;
      },
      toggleLanguage: () => {
        const newLang = get().language === 'fr' ? 'ar' : 'fr';
        get().setLanguage(newLang);
      },
      isRTL: false,
    }),
    {
      name: 'language-storage',
    }
  )
);
