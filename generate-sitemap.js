#!/usr/bin/env node

/**
 * Script para generar automáticamente el sitemap.xml
 * Ejecutar con: node generate-sitemap.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtener el directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración
const BASE_URL = 'https://www.game4git.games';
const PUBLIC_DIR = path.join(__dirname, 'public');
const PAGES_DIR = path.join(__dirname, 'src', 'pages');
const OUTPUT_FILE = path.join(PUBLIC_DIR, 'sitemap.xml');

// Fecha actual en formato ISO (YYYY-MM-DD)
const getCurrentDate = () => {
  const date = new Date();
  return date.toISOString().split('T')[0];
};

// Detectar rutas automáticamente desde src/pages
const detectRoutes = () => {
  const routes = [
    { path: '/', priority: '1.0', changefreq: 'weekly' },
  ];

  try {
    if (fs.existsSync(PAGES_DIR)) {
      const files = fs.readdirSync(PAGES_DIR);
      
      files.forEach(file => {
        // Detectar solo archivos .tsx que no sean Index.tsx (ya incluido como '/')
        if (file.endsWith('.tsx') && file !== 'Index.tsx') {
          const routeName = file.replace('.tsx', '');
          let path = `/${routeName.toLowerCase()}`;
          
          // Caso especial para NotFound.tsx
          if (routeName === 'NotFound') {
            path = '/404';
          }
          
          // Evitar duplicados
          if (!routes.some(r => r.path === path)) {
            routes.push({
              path,
              priority: path === '/' ? '1.0' : '0.7',
              changefreq: path === '/' ? 'weekly' : 'monthly'
            });
          }
        }
      });
    }
  } catch (error) {
    console.error(`❌ Error al detectar rutas: ${error.message}`);
  }

  return routes;
};

// Función para generar el XML
const generateSitemap = () => {
  // Detectar rutas automáticamente
  const routes = detectRoutes();
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  // Agregar cada ruta
  routes.forEach(route => {
    xml += '  <url>\n';
    xml += `    <loc>${BASE_URL}${route.path}</loc>\n`;
    xml += `    <lastmod>${getCurrentDate()}</lastmod>\n`;
    xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
    xml += `    <priority>${route.priority}</priority>\n`;
    xml += '  </url>\n';
  });
  
  xml += '</urlset>';
  return xml;
};

// Guardar el sitemap.xml
const saveSitemap = (xml) => {
  try {
    fs.writeFileSync(OUTPUT_FILE, xml);
    console.log(`✅ Sitemap generado exitosamente en: ${OUTPUT_FILE}`);
  } catch (error) {
    console.error('❌ Error al guardar el sitemap:', error);
  }
};

// Ejecutar la generación del sitemap
const xml = generateSitemap();
saveSitemap(xml); 