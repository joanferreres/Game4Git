# Explicación de los Tests

## test-build.js

Este script valida la compilación de producción del proyecto. Es un test de integración que verifica que la construcción (`build`) del proyecto se ha realizado correctamente.

### ¿Qué hace?

El script `test-build.js` realiza las siguientes validaciones:

1. **Verifica la existencia del directorio `dist`**: Comprueba que el directorio de distribución existe. Si no existe, el script falla y muestra un mensaje indicando que primero debe ejecutarse `npm run build`.

2. **Verifica la existencia de `index.html`**: Comprueba que el archivo `index.html` principal está presente en el directorio `dist`.

3. **Verifica la presencia de archivos JavaScript**: Busca en `dist/assets` para asegurar que existen archivos JavaScript compilados (`.js`).

4. **Verifica la presencia de archivos CSS**: Busca en `dist/assets` para asegurar que existen archivos CSS compilados (`.css`).

5. **Valida el contenido HTML**: Lee el contenido de `index.html` y verifica la presencia de elementos críticos:
   - **Título**: Verifica que existe una etiqueta `<title>`
   - **Div raíz**: Verifica que existe el div con id "root" (`<div id="root"></div>`)
   - **Link CSS**: Verifica que hay una referencia a hojas de estilo
   - **Script JS**: Verifica que hay referencias a scripts JavaScript
   - **Content Security Policy**: Verifica que el HTML incluye políticas de seguridad de contenido

### ¿Cómo se ejecuta?

Para ejecutar este test:

```bash
npm run test:build
```

**Nota**: Primero debes construir el proyecto con `npm run build` antes de ejecutar este test.

### Resultados

El script muestra:
- ✅ para cada validación que pasa correctamente
- ❌ para cada validación que falla
- Un mensaje final indicando si la compilación está lista para despliegue o si hay problemas que resolver

## Otros Tests

Actualmente, el proyecto no tiene otros tests unitarios o de integración configurados. Solo existe el test de validación de build (`test-build.js`).
