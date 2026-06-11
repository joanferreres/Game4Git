#!/usr/bin/env node

/**
 * Script para generar automáticamente el sitemap.xml
 * Ejecutar con: node generate-sitemap.js
 */

const fs = require('fs');
const path = require('path');
const { SITE_URL } = require('./src/config/site.cjs');

// Configuración
const BASE_URL = process.env.SITEMAP_BASE_URL || SITE_URL;
const PUBLIC_DIR = path.join(__dirname, 'public');
const OUTPUT_FILE = path.join(PUBLIC_DIR, 'sitemap.xml');
const LOCALES = ['en', 'es', 'ca', 'fr'];
const DEFAULT_LOCALE = 'en';

// Fecha actual en formato ISO (YYYY-MM-DD)
const getCurrentDate = () => {
  const date = new Date();
  return date.toISOString().split('T')[0];
};

const normalizePath = (pathname) => {
  if (!pathname || pathname === '/') {
    return '/';
  }

  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
};

const getLocalizedPath = (pathname, locale) => {
  const normalized = normalizePath(pathname);

  if (locale === DEFAULT_LOCALE) {
    return normalized;
  }

  return normalized === '/' ? `/${locale}` : `/${locale}${normalized}`;
};

const buildAlternates = (pathname) => {
  const routePath = normalizePath(pathname);
  const defaultUrl = `${BASE_URL}${routePath}`;

  return [
    { hreflang: 'x-default', href: defaultUrl },
    ...LOCALES.map((locale) => ({
      hreflang: locale,
      href: `${BASE_URL}${getLocalizedPath(routePath, locale)}`,
    })),
  ];
};

const detectRoutes = () => {
  const baseRoutes = [
    { path: '/', priority: '1.0', changefreq: 'weekly' },
    { path: '/playground', priority: '0.95', changefreq: 'weekly' },
    { path: '/git-practice-game', priority: '0.9', changefreq: 'weekly' },
    { path: '/git-branch-practice', priority: '0.9', changefreq: 'weekly' },
    { path: '/git-merge-conflicts', priority: '0.9', changefreq: 'weekly' },
    { path: '/git-remote-workflow', priority: '0.85', changefreq: 'weekly' },
    { path: '/git-reset-guide', priority: '0.85', changefreq: 'weekly' },
    { path: '/gdb', priority: '0.8', changefreq: 'weekly' },
    { path: '/valgrind', priority: '0.8', changefreq: 'weekly' },
    { path: '/valgrind-memory-leaks', priority: '0.7', changefreq: 'weekly' },
  ];

  return baseRoutes.flatMap((route) =>
    LOCALES.map((locale) => ({
      ...route,
      locale,
      localizedPath: getLocalizedPath(route.path, locale),
      alternates: buildAlternates(route.path),
    }))
  );
};

// Función para generar el XML
const generateSitemap = () => {
  // Detectar rutas automáticamente
  const routes = detectRoutes();
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';
  
  routes.forEach(route => {
    xml += '  <url>\n';
    xml += `    <loc>${BASE_URL}${route.localizedPath}</loc>\n`;
    route.alternates.forEach((alternate) => {
      xml += `    <xhtml:link rel="alternate" hreflang="${alternate.hreflang}" href="${alternate.href}" />\n`;
    });
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
