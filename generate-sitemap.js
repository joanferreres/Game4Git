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
const BASE_URL = process.env.SITEMAP_BASE_URL || 'https://game4git.games';
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
  // Base routes (static)
  const routes = new Map();
  const add = (p, priority, changefreq) => routes.set(p, { path: p, priority, changefreq });

  add('/', '1.0', 'weekly');
  add('/gdb', '0.9', 'weekly');
  add('/valgrind', '0.9', 'weekly');
  // 404 should not be included in sitemap

  // No i18n variants in sitemap to avoid URL inflation

  // Return unique list
  return Array.from(routes.values());
};

// Función para generar el XML
const generateSitemap = () => {
  // Detectar rutas automáticamente
  const routes = detectRoutes();
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';
  
  // Agregar cada ruta (sin xhtml alternates; hreflang va en HTML)
  routes.forEach(route => {
    xml += '  <url>\n';
    xml += `    <loc>${BASE_URL}${route.path}</loc>\n`;
    xml += `    <lastmod>${getCurrentDate()}</lastmod>\n`;
    xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
    xml += `    <priority>${route.priority}</priority>\n`;
    // no xhtml alternates
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