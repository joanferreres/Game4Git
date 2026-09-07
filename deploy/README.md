# Despliegue de Git Game Visualizer

## Español

### Proceso de despliegue en Cloudflare Workers

Para desplegar esta aplicación en Cloudflare Workers:

1. Asegúrate de tener una cuenta en [Cloudflare](https://dash.cloudflare.com).
2. Autentica Wrangler: `npx wrangler login`
3. Ejecuta los siguientes comandos:

```bash
# Realizar el build de la aplicación
npm run build

# Ejecutar comprobaciones de seguridad
npm run security:check

# Desplegar en Cloudflare Workers
npm run deploy
```

La aplicación utiliza los siguientes archivos de configuración para el despliegue:
- `wrangler.jsonc`: Worker, assets SPA y observabilidad
- `public/_headers`: Cabeceras de seguridad y caché
- `deploy.sh`: Script que automatiza el proceso de despliegue

### Dominio personalizado

Tras el primer deploy, adjunta `game4git.com` al Worker en el dashboard de Cloudflare:

**Workers & Pages → game4git → Settings → Domains & Routes → Add → Custom Domain**

Si el DNS de `game4git.com` ya está en Cloudflare, el registro CNAME se crea automáticamente.

### Notas importantes
- La aplicación requiere Node.js 18.x o superior
- El fallback SPA (`not_found_handling: single-page-application`) cubre las rutas de React Router
- Variables de build como `VITE_ADMIN_PASSWORD_HASH` se definen en el entorno de build / Workers Builds

## Català

### Procés de desplegament a Cloudflare Workers

1. Compte a [Cloudflare](https://dash.cloudflare.com).
2. `npx wrangler login`
3. `npm run deploy`

Fitxers clau: `wrangler.jsonc`, `public/_headers`, `deploy.sh`.

## Français

### Processus de déploiement sur Cloudflare Workers

1. Compte sur [Cloudflare](https://dash.cloudflare.com).
2. `npx wrangler login`
3. `npm run deploy`

Fichiers clés : `wrangler.jsonc`, `public/_headers`, `deploy.sh`.
