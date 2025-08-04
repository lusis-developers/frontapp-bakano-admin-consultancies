# 🚀 Guía de Despliegue

Guía completa para desplegar la aplicación Bakano Admin en diferentes entornos.

## 📋 Índice

- [Preparación](#preparación)
- [Despliegue en Netlify](#despliegue-en-netlify)
- [Despliegue en Vercel](#despliegue-en-vercel)
- [Despliegue en AWS S3 + CloudFront](#despliegue-en-aws)
- [Dockerización](#dockerización)
- [Variables de Entorno](#variables-de-entorno)
- [Monitoreo](#monitoreo)
- [Rollback](#rollback)

---

## 🛠️ Preparación

### 1. Construcción de Producción

```bash
# Instalar dependencias
pnpm install

# Construir para producción
pnpm build

# Verificar build localmente
pnpm preview
```

### 2. Verificación Pre-despliegue

```bash
# Verificar tipos TypeScript
pnpm type-check

# Formatear código
pnpm format

# Verificar que no hay errores
pnpm lint
```

### 3. Archivos Necesarios

Asegúrate de tener:
- [ ] `dist/` generado después del build
- [ ] `_redirects` en carpeta `public/`
- [ ] Variables de entorno configuradas
- [ ] Archivos de configuración actualizados

---

## 🌐 Despliegue en Netlify

### Opción 1: Despliegue Manual

1. **Build Settings**:
   - **Build Command**: `pnpm build`
   - **Publish Directory**: `dist`

2. **Environment Variables**:
   ```bash
   NODE_ENV=production
   VITE_API_BASE_URL=https://api-prod.bakano.com
   VITE_APP_NAME=Bakano Admin
   ```

3. **Redirects Configuration** (`public/_redirects`):
   ```
   /*    /index.html   200
   ```

4. **Netlify Configuration** (`netlify.toml`):
   ```toml
   [build]
     command = "pnpm build"
     publish = "dist"
   
   [build.environment]
     NODE_VERSION = "18"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

### Opción 2: Despliegue Automático con Git

1. Conectar repositorio en Netlify
2. Configurar build settings
3. Configurar variables de entorno
4. Deploy automático en cada push a main

---

## ▲ Despliegue en Vercel

### 1. Configuración del Proyecto

**vercel.json**:
```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

### 2. Variables de Entorno

Configurar en Vercel Dashboard:
- `VITE_API_BASE_URL`
- `VITE_APP_NAME`
- `NODE_ENV=production`

### 3. Despliegue

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel --prod

# Desplegar con variables de entorno
vercel --prod -e VITE_API_BASE_URL=https://api-prod.bakano.com
```

---

## ☁️ Despliegue en AWS S3 + CloudFront

### 1. Configuración de S3

```bash
# AWS CLI Configuration
aws configure

# Crear bucket
aws s3 mb s3://bakano-admin-prod

# Configurar bucket para hosting estático
aws s3 website s3://bakano-admin-prod --index-document index.html --error-document index.html
```

### 2. Build y Upload

```bash
# Construir
pnpm build

# Sincronizar archivos
aws s3 sync dist/ s3://bakano-admin-prod --delete

# Configurar política de bucket
aws s3api put-bucket-policy --bucket bakano-admin-prod --policy file://bucket-policy.json
```

### 3. CloudFront Distribution

**cloudfront-config.json**:
```json
{
  "DistributionConfig": {
    "Origins": {
      "Quantity": 1,
      "Items": [{
        "Id": "bakano-admin-origin",
        "DomainName": "bakano-admin-prod.s3-website-us-east-1.amazonaws.com",
        "CustomOriginConfig": {
          "HTTPPort": 80,
          "HTTPSPort": 443,
          "OriginProtocolPolicy": "http-only"
        }
      }]
    },
    "DefaultCacheBehavior": {
      "TargetOriginId": "bakano-admin-origin",
      "ViewerProtocolPolicy": "redirect-to-https",
      "AllowedMethods": {
        "Quantity": 2,
        "Items": ["GET", "HEAD"]
      }
    }
  }
}
```

### 4. Bucket Policy

**bucket-policy.json**:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::bakano-admin-prod/*"
    }
  ]
}
```

---

## 🐳 Dockerización

### Dockerfile

```dockerfile
# Etapa de build
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar archivos de configuración
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Copiar código fuente
COPY . .

# Build de producción
RUN pnpm build

# Etapa de producción
FROM nginx:alpine

# Copiar archivos build
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Exponer puerto
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf

```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Gzip compression
        gzip on;
        gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

        # Cache headers
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # SPA routing
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
    }
}
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  bakano-admin:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
      - VITE_API_BASE_URL=https://api-prod.bakano.com
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### Comandos Docker

```bash
# Construir imagen
docker build -t bakano-admin:latest .

# Ejecutar localmente
docker run -p 80:80 bakano-admin:latest

# Ejecutar con docker-compose
docker-compose up -d

# Ver logs
docker-compose logs -f bakano-admin
```

---

## 🔐 Variables de Entorno por Entorno

### Desarrollo (.env.development)
```bash
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=Bakano Admin (Dev)
VITE_LOG_LEVEL=debug
VITE_ENABLE_CONSOLE=true
```

### Staging (.env.staging)
```bash
VITE_API_BASE_URL=https://api-staging.bakano.com
VITE_APP_NAME=Bakano Admin (Staging)
VITE_LOG_LEVEL=info
VITE_ENABLE_CONSOLE=false
```

### Producción (.env.production)
```bash
VITE_API_BASE_URL=https://api-prod.bakano.com
VITE_APP_NAME=Bakano Admin
VITE_LOG_LEVEL=error
VITE_ENABLE_CONSOLE=false
```

---

## 📊 Monitoreo

### 1. Google Analytics

```typescript
// src/utils/analytics.ts
export const initGA = () => {
  if (import.meta.env.PROD) {
    window.gtag('config', import.meta.env.VITE_GOOGLE_ANALYTICS_ID)
  }
}

router.afterEach((to) => {
  if (window.gtag) {
    window.gtag('config', import.meta.env.VITE_GOOGLE_ANALYTICS_ID, {
      page_path: to.path
    })
  }
})
```

### 2. Sentry

```typescript
// src/main.ts
import * as Sentry from '@sentry/vue'

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [new Sentry.BrowserTracing()],
    tracesSampleRate: 0.2
  })
}
```

### 3. Health Check

```typescript
// src/utils/health-check.ts
export const healthCheck = async () => {
  try {
    const response = await fetch('/api/health')
    return response.ok
  } catch (error) {
    console.error('Health check failed:', error)
    return false
  }
}
```

---

## 🔄 Rollback

### 1. Rollback Manual

```bash
# Netlify
# Ir a Deploys → Seleccionar versión anterior → Publish deploy

# Vercel
# Ir a Deployments → Seleccionar versión → Promote to Production

# AWS S3
aws s3 sync s3://bakano-admin-backup/ s3://bakano-admin-prod --delete
```

### 2. Rollback Automático

**GitHub Actions**:
```yaml
name: Rollback
on:
  workflow_dispatch:
    inputs:
      version:
        description: 'Version to rollback to'
        required: true
        type: string

jobs:
  rollback:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          ref: ${{ github.event.inputs.version }}
      
      - name: Deploy to production
        run: |
          pnpm install
          pnpm build
          # Comandos de despliegue
```

---

## 📋 Checklist de Despliegue

### Pre-despliegue

- [ ] Tests pasando
- [ ] Build exitoso
- [ ] Variables de entorno configuradas
- [ ] Archivos de configuración actualizados
- [ ] Optimizaciones de imagen aplicadas
- [ ] Código minificado

### Post-despliegue

- [ ] Verificar URL funcional
- [ ] Testear funcionalidades principales
- [ ] Verificar logs de errores
- [ ] Comprobar métricas de rendimiento
- [ ] Validar SEO básico
- [ ] Testear en diferentes navegadores

### Monitoreo Inicial

- [ ] Verificar Google Analytics
- [ ] Verificar Sentry (si aplica)
- [ ] Monitorear errores 404
- [ ] Revisar logs de CloudWatch (AWS)
- [ ] Verificar uptime con Pingdom o similar

---

## 🚨 Troubleshooting

### Problemas Comunes

#### 1. Build falla
```bash
# Limpiar caché
pnpm store prune
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Verificar dependencias
pnpm audit
```

#### 2. 404 en rutas SPA
```bash
# Asegurar redirects configurados
# Verificar nginx/apache configuration
```

#### 3. CORS issues
```bash
# Verificar CORS en API
# Configurar proxy si es necesario
```

#### 4. Variables de entorno no cargan
```bash
# Verificar prefijo VITE_
# Verificar sintaxis en .env
# Verificar build logs
```

---

## 📞 Soporte Post-despliegue

### Contacto de Emergencia

- **Equipo DevOps**: devops@bakano.com
- **On-call**: +593-XXX-XXXX-XXX
- **Status Page**: status.bakano.com

### Runbooks

- **Rollback inmediato**: Ver sección Rollback
- **Escalamiento**: Contactar al equipo de infraestructura
- **Documentación**: docs.bakano.com/deployment