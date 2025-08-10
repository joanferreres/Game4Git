import { useTranslation } from 'react-i18next';

export const useLanguage = () => {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    // Persist for i18next-browser-languagedetector
    localStorage.setItem('i18nextLng', lng);
  };

  const getCurrentLanguage = () => {
    return i18n.language;
  };

  const getAvailableLanguages = () => {
    return [
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'es', name: 'Español', flag: '🇪🇸' },
      { code: 'ca', name: 'Català', flag: '🏴' },
      { code: 'fr', name: 'Français', flag: '🇫🇷' }
    ];
  };

  return {
    t,
    changeLanguage,
    getCurrentLanguage,
    getAvailableLanguages,
    currentLanguage: i18n.language
  };
};
