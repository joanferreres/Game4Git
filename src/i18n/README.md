# Gestión de Idiomas (i18n)

Esta aplicación incluye un sistema completo de internacionalización (i18n) usando `react-i18next`.

## Características

- ✅ Detección automática del idioma del navegador
- ✅ Persistencia del idioma seleccionado en localStorage
- ✅ Componente selector de idioma con dos variantes (dropdown y select)
- ✅ Hook personalizado para gestión de idiomas
- ✅ Contexto de idioma para gestión global
- ✅ Soporte para 5 idiomas: English, Español, Català, Français, Deutsch

## Uso Básico

### 1. Hook useLanguage

```tsx
import { useLanguage } from '@/hooks/useLanguage';

function MyComponent() {
  const { t, changeLanguage, currentLanguage } = useLanguage();
  
  return (
    <div>
      <h1>{t('common.title')}</h1>
      <button onClick={() => changeLanguage('es')}>
        Cambiar a Español
      </button>
      <p>Idioma actual: {currentLanguage}</p>
    </div>
  );
}
```

### 2. Componente LanguageSelector

```tsx
import { LanguageSelector } from '@/components/ui/language-selector';

// Variante dropdown (recomendada)
<LanguageSelector variant="dropdown" />

// Variante select
<LanguageSelector variant="select" />
```

### 3. Contexto de Idioma (opcional)

```tsx
import { LanguageProvider } from '@/contexts/LanguageContext';

function App() {
  return (
    <LanguageProvider>
      <YourApp />
    </LanguageProvider>
  );
}
```

## Estructura de Archivos

```
src/i18n/
├── index.ts                 # Configuración principal de i18next
├── locales/
│   ├── en.json             # Traducciones en inglés
│   ├── es.json             # Traducciones en español
│   ├── ca.json             # Traducciones en catalán
│   ├── fr.json             # Traducciones en francés
│   └── de.json             # Traducciones en alemán
└── README.md               # Esta documentación
```

## Añadir Nuevas Traducciones

1. Añade las claves en todos los archivos de idioma en `src/i18n/locales/`
2. Usa la función `t()` en tus componentes:

```tsx
const { t } = useLanguage();
return <p>{t('nuevaClave.subClave')}</p>;
```

## Configuración

La configuración se encuentra en `src/i18n/index.ts`:

- **Idioma por defecto**: English (`en`)
- **Detección**: localStorage → navegador → HTML lang
- **Persistencia**: localStorage con clave `language`
- **Debug**: Activado en desarrollo

## Idiomas Disponibles

| Código | Idioma    | Bandera |
|--------|-----------|---------|
| `en`   | English   | 🇺🇸      |
| `es`   | Español   | 🇪🇸      |
| `ca`   | Català    | 🏴󠁥󠁳󠁣󠁴󠁿      |
| `fr`   | Français  | 🇫🇷      |
| `de`   | Deutsch   | 🇩🇪      |

## Ejemplo Completo

Ver `src/components/examples/LanguageExample.tsx` para un ejemplo completo de implementación.
