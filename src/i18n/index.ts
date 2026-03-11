import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enTranslation from './locales/en.json';
import esTranslation from './locales/es.json';
import caTranslation from './locales/ca.json';
import frTranslation from './locales/fr.json';

// Nombres completos de los idiomas para mostrar en la interfaz
export const languageNames = {
  en: 'English',
  es: 'Español',
  ca: 'Català',
  fr: 'Français',
  
};

// Configuración de idiomas soportados
export const supportedLngs = Object.keys(languageNames);

// Configuración básica de i18n
const i18nConfig = {
  resources: {
    en: { translation: enTranslation },
    es: { translation: esTranslation },
    ca: { translation: caTranslation },
    fr: { translation: frTranslation },
    
  },
  lng: 'en',
  fallbackLng: 'en',
  supportedLngs,
  debug: process.env.NODE_ENV === 'development',
  
  // Configuración del detector de idioma
  detection: {
    order: ['path', 'htmlTag'],
    lookupFromPathIndex: 0,
    caches: [],
    checkWhitelist: true
  },
  
  // No usar cookies para almacenar el idioma
  saveMissing: false,
  
  // Configuración de carga de idiomas
  load: 'languageOnly' as const,
  
  // Configuración de interpolación
  interpolation: {
    escapeValue: false, // No es necesario escapar con React
  },
  
  // Configuración de React
  react: {
    useSuspense: false,
    bindI18n: 'languageChanged loaded',
    bindStore: 'added removed',
    nsMode: 'default' as const
  },
  
  // Manejo de errores
  // Importante: no sobrescribir el defaultValue de t().
  // Usamos missingKeyHandler solo para loguear.
  missingKeyHandler: (lng: string, ns: string, key: string, fallbackValue: string) => {
    console.warn(`[i18n] Clave de traducción faltante: ${key} (lng=${lng}, ns=${ns})`);
  }
};

// Inicializar i18n
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init(i18nConfig)
  .then(() => {
    console.log('i18n inicializado correctamente');
    // Establecer el atributo lang del documento al idioma actual
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', i18n.language || 'en');
      const contentLangMeta = document.querySelector('meta[name="content-language"]');
      if (contentLangMeta) {
        contentLangMeta.setAttribute('content', i18n.language || 'en');
      }
    }
  })
  .catch((error) => {
    console.error('Error al inicializar i18n:', error);
  });

// Actualizar <html lang> y meta content-language cuando cambie el idioma
if (typeof window !== 'undefined') {
  i18n.on('languageChanged', (lng) => {
    try {
      document.documentElement.setAttribute('lang', lng);
      const contentLangMeta = document.querySelector('meta[name="content-language"]');
      if (contentLangMeta) {
        contentLangMeta.setAttribute('content', lng);
      }
    } catch (_) {
      // noop
    }
  });
}

export default i18n; 
