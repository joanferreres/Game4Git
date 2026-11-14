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

# Desplegar en Cloudflare Workers (producción)
npm run deploy
```

La aplicación utiliza los siguientes archivos de configuración para el despliegue:
- `wrangler.jsonc`: Worker, assets SPA, `preview_urls` y observabilidad
- `public/_headers`: Cabeceras de seguridad y caché
- `deploy.sh`: Script que automatiza el proceso de despliegue

GitHub Actions solo hace lint/build/security. El deploy a producción es Cloudflare (Wrangler o Workers Builds), no Vercel.

### Preview de una rama (sin tocar producción)

Opción A — CLI (rápido, con cuenta Cloudflare autenticada):

```bash
git checkout cursor/gitoryx-v1-ae77   # o cualquier rama
npm run preview:cf
# equivalente: npm run build && npx wrangler preview --name cursor-gitoryx-v1-ae77
```

`wrangler preview` usa el nombre de la rama Git por defecto y imprime una Preview URL
(`<preview-name>-game4git.<subdomain>.workers.dev`). No despliega a `game4git.com`.

Opción B — Workers Builds (recomendado para PRs):

1. Cloudflare dashboard → **Workers & Pages** → **game4git** → **Settings** → **Builds**
2. Conecta el repo `joanferreres/Game4Git` si aún no está
3. Production branch: `main` → deploy command `npx wrangler deploy`
4. Activa **Builds for Preview branches** → Preview command `npx wrangler preview`
5. Push a la rama (p. ej. `cursor/gitoryx-v1-ae77`) → Preview en el dashboard (**Previews**) y comentario en el PR si la integración GitHub está activa

### Dominio personalizado

Tras el primer deploy, adjunta `game4git.com` al Worker en el dashboard de Cloudflare:

**Workers & Pages → game4git → Settings → Domains & Routes → Add → Custom Domain**

Si el DNS de `game4git.com` ya está en Cloudflare, el registro CNAME se crea automáticamente.

### Notas importantes
- La aplicación requiere Node.js 18.x o superior
- El fallback SPA (`not_found_handling: single-page-application`) cubre las rutas de React Router
- Variables de build como `VITE_ADMIN_PASSWORD_HASH` se definen en el entorno de build / Workers Builds

### Turnstile (analytics verificadas)

Widget invisible `game4git-analytics` para marcar pageviews como verificadas en D1 (`verified=1`). Si Turnstile falla o se bloquea, el track sigue respondiendo 200 con `verified=0` (fail-open).

**Build / cliente (público):**

| Variable | Dónde | Valor |
|----------|-------|-------|
| `VITE_TURNSTILE_SITE_KEY` | `.env`, CI/Workers Builds | Sitekey del widget Turnstile |

**Worker (secretos — nunca en el repo):**

| Variable | Dónde | Valor |
|----------|-------|-------|
| `TURNSTILE_SECRET` | `wrangler secret put` / `.dev.vars` local | Secret key del widget |
| `TURNSTILE_HOSTNAMES` | `wrangler secret put` / `.dev.vars` local | Hostnames permitidos en siteverify, separados por coma |

Ejemplos:

```bash
# Local (.dev.vars)
TURNSTILE_SECRET=<secret>
TURNSTILE_HOSTNAMES=localhost,127.0.0.1,game4git.com,www.game4git.com

# Producción (solo dominios reales, sin localhost)
printf '%s' '<secret>' | npx wrangler secret put TURNSTILE_SECRET
printf '%s' 'game4git.com,www.game4git.com' | npx wrangler secret put TURNSTILE_HOSTNAMES
```

**Migración D1** (columna `verified`):

```bash
npx wrangler d1 migrations apply game4git-analytics --remote
```

**Turnstile (analytics verified)** — same vars in English:

- `VITE_TURNSTILE_SITE_KEY`: public sitekey at build time (`.env`, Workers Builds).
- `TURNSTILE_SECRET`: Worker secret; Turnstile secret key.
- `TURNSTILE_HOSTNAMES`: comma-separated hostnames accepted by siteverify (`game4git.com,www.game4git.com` in prod; add `localhost,127.0.0.1` for local `.dev.vars`).
- Ensure the Turnstile widget domains include production hosts before deploy.

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
