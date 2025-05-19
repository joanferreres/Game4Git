# Despliegue de Git Game Visualizer

## Español

### Proceso de despliegue en Vercel

Para desplegar esta aplicación en Vercel:

1. Asegúrate de tener una cuenta en [Vercel](https://vercel.com).
2. Instala la CLI de Vercel: `npm install -g vercel`
3. Ejecuta los siguientes comandos:

```bash
# Realizar el build de la aplicación
npm run build

# Ejecutar comprobaciones de seguridad
npm run security:check

# Desplegar en Vercel
vercel --prod
```

La aplicación utiliza los siguientes archivos de configuración para el despliegue:
- `vercel.json`: Configuración de rutas, headers de seguridad y redirecciones
- `deploy.sh`: Script que automatiza el proceso de despliegue

### Notas importantes
- La aplicación requiere Node.js 16.x o superior
- Se han resuelto los problemas con CSP (Content Security Policy) y X-Frame-Options
- Vercel configurará automáticamente las variables de entorno según `vercel.json`

## Català

### Procés de desplegament a Vercel

Per desplegar aquesta aplicació a Vercel:

1. Assegura't de tenir un compte a [Vercel](https://vercel.com).
2. Instal·la la CLI de Vercel: `npm install -g vercel`
3. Executa les següents comandes:

```bash
# Realitzar el build de l'aplicació
npm run build

# Executar comprovacions de seguretat
npm run security:check

# Desplegar a Vercel
vercel --prod
```

L'aplicació utilitza els següents fitxers de configuració per al desplegament:
- `vercel.json`: Configuració de rutes, capçaleres de seguretat i redireccions
- `deploy.sh`: Script que automatitza el procés de desplegament

### Notes importants
- L'aplicació requereix Node.js 16.x o superior
- S'han resolt els problemes amb CSP (Content Security Policy) i X-Frame-Options
- Vercel configurarà automàticament les variables d'entorn segons `vercel.json`

## Français

### Processus de déploiement sur Vercel

Pour déployer cette application sur Vercel:

1. Assurez-vous d'avoir un compte sur [Vercel](https://vercel.com).
2. Installez la CLI de Vercel: `npm install -g vercel`
3. Exécutez les commandes suivantes:

```bash
# Construire l'application
npm run build

# Exécuter les vérifications de sécurité
npm run security:check

# Déployer sur Vercel
vercel --prod
```

L'application utilise les fichiers de configuration suivants pour le déploiement:
- `vercel.json`: Configuration des routes, des en-têtes de sécurité et des redirections
- `deploy.sh`: Script qui automatise le processus de déploiement

### Notes importantes
- L'application nécessite Node.js 16.x ou supérieur
- Les problèmes avec CSP (Content Security Policy) et X-Frame-Options ont été résolus
- Vercel configurera automatiquement les variables d'environnement selon `vercel.json` 