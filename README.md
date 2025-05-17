# Git Game Visualizer

Una aplicación web interactiva para aprender conceptos de Git visualmente. Permite crear y manipular repositorios Git virtuales, visualizando ramas, commits, y operaciones de Git como merge y branch de forma gráfica.

![Git Game Visualizer](public/logo.png)

## Características

- Editor de código integrado (Monaco Editor)
- Visualización gráfica del historial de Git con ReactFlow
- Soporte para ramas, commits y merges
- Visor de diferencias (diff)
- Interfaz moderna y responsiva con Tailwind CSS y Shadcn/ui
- Experiencia de usuario guiada con instrucciones paso a paso

## Requisitos previos

- Node.js (v16 o superior)
- npm (v7 o superior)

## Instalación

1. Clona el repositorio:

```bash
git clone https://github.com/tu-usuario/commit-quest-visualizer.git
cd commit-quest-visualizer
```

2. Instala las dependencias:

```bash
npm install
```

> **Nota**: Si encuentras errores de dependencias con conflictos de pares, puedes usar:
> ```bash
> npm install --legacy-peer-deps
> ```

## Desarrollo

### Iniciar servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:8080`.

### Scripts disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run build:dev` - Construye la aplicación en modo desarrollo
- `npm run build:prod` - Construye la aplicación optimizada para producción
- `npm run preview` - Sirve la versión construida localmente
- `npm run lint` - Ejecuta el linter para encontrar problemas de código
- `npm run test:build` - Verifica la integridad de la construcción de producción

## Preparación para producción

Para preparar la aplicación para despliegue en producción, puedes usar el script automatizado:

```bash
chmod +x prepare-for-prod.sh
./prepare-for-prod.sh
```

O alternativamente, puedes ejecutar el comando npm:

```bash
npm run prepare:prod
```

Este script:

1. Limpia construcciones anteriores
2. Instala dependencias de producción
3. Ejecuta linting para verificar problemas de código
4. Construye la aplicación con optimizaciones de producción
5. Comprime y optimiza assets
6. Verifica vulnerabilidades de seguridad

## Despliegue

### Opciones de despliegue

#### 1. Servidor web estático

Copia todo el contenido de la carpeta `dist` a tu servidor web.

```bash
# Ejemplo con rsync
rsync -av --delete dist/ usuario@servidor:/ruta/a/tu/sitio/
```

#### 2. Netlify

1. Conecta tu repositorio de GitHub a Netlify
2. Configura el directorio de publicación como `dist`
3. Configura el comando de construcción como `npm run build:prod`

#### 3. Vercel

1. Instala Vercel CLI: `npm install -g vercel`
2. Ejecuta `vercel --prod` desde la raíz del proyecto

#### 4. GitHub Pages

1. Construye la aplicación: `npm run build:prod`
2. Despliega la carpeta `dist` a la rama gh-pages:

```bash
# Si usas gh-pages
npm install -g gh-pages
gh-pages -d dist
```

## Solución de problemas comunes

### Error al cargar el editor de código

Si el editor de código muestra "Cargando editor de código..." indefinidamente:

1. Verifica que la política de seguridad de contenido (CSP) en `index.html` permita cargar recursos de Monaco editor:
   - Los scripts de `cdn.jsdelivr.net` deben estar permitidos
   - Los Web Workers (blob:) deben estar permitidos

2. Limpia la caché del navegador e intenta de nuevo

### Errores de dependencias

Si encuentras errores de dependencias durante la instalación:

```bash
npm install --legacy-peer-deps
```

## Tecnologías utilizadas

- React
- TypeScript
- Vite
- React Flow (@xyflow/react)
- Monaco Editor
- Zustand (gestión de estado)
- Shadcn/ui + Radix UI (componentes)
- Tailwind CSS
- React Router DOM

## Licencia

© 2024 Joan Ferreres Vivero. Todos los derechos reservados.
# Game4Git
