import { useTranslation } from 'react-i18next';
import { useLanguageStore } from '../stores/useLanguageStore';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const { t } = useTranslation();
  const { language, toggleLanguage } = useLanguageStore();

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200"
      style={{
        background: 'var(--bg-panel)',
        border: '1px solid var(--border)',
        color: 'var(--text-secondary)',
      }}
      aria-label={t('common.language')}
    >
      <Globe className="w-4 h-4" />
      <span className="text-xs font-semibold">
        {language === 'fr' ? 'ع' : 'FR'}
      </span>
    </button>
  );
}
