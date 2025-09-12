# 🗺️ Documentación de Rutas y Navegación

Documentación completa de las rutas, navegación y flujo de la aplicación Bakano Admin.

## 📍 Índice de Rutas

- [Estructura General](#estructura-general)
- [Rutas Públicas](#rutas-públicas)
- [Rutas Protegidas](#rutas-protegidas)
- [Parámetros de Ruta](#parámetros-de-ruta)
- [Meta Información](#meta-información)
- [Navegación](#navegación)
- [Guards de Ruta](#guards-de-ruta)

---

## 🏗️ Estructura General

**Archivo de configuración**: `src/router/index.ts`

La aplicación utiliza Vue Router con el siguiente patrón de rutas:

```typescript
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [/* ... rutas ... */]
})
```

---

## 🌐 Rutas Públicas

### `/` - Home
- **Componente**: `views/HomeView.vue`
- **Descripción**: Página de inicio que redirige al dashboard si el usuario está autenticado
- **Acceso**: Público
- **Redirección**: Si está autenticado → `/dashboard`

### `/login` - Login
- **Componente**: `views/LoginView.vue`
- **Descripción**: Formulario de autenticación para administradores
- **Acceso**: Público
- **Credenciales**: admin@bakano.ec / Bakano2024!

---

## 🔒 Rutas Protegidas

Todas estas rutas requieren autenticación y están protegidas por el guard de ruta.

### `/dashboard` - Dashboard Principal
- **Componente**: `views/DashboardView.vue`
- **Descripción**: Vista principal con estadísticas y resumen de actividad
- **Meta**: `{ requiresAuth: true }`

### `/client/:clientId` - Detalles del Cliente
- **Componente**: `views/client.vue`
- **Descripción**: Vista detallada de un cliente específico
- **Parámetros**: 
  - `clientId` (string): ID único del cliente
- **Meta**: `{ requiresAuth: true }`
- **Ejemplo**: `/client/507f1f77bcf86cd799439011`

### `/client/:clientId/businesses` - Negocios del Cliente
- **Componente**: `views/businesses/index.vue`
- **Nombre de ruta**: `businesses`
- **Descripción**: Lista de todos los negocios asociados a un cliente
- **Parámetros**:
  - `clientId` (string): ID único del cliente
- **Meta**: `{ requiresAuth: true }`
- **Ejemplo**: `/client/507f1f77bcf86cd799439011/businesses`

### `/client/:clientId/business/:businessId` - Detalles del Negocio
- **Componente**: `views/businesses/business.vue`
- **Nombre de ruta**: `businessDetails`
- **Descripción**: Vista detallada de un negocio específico
- **Parámetros**:
  - `clientId` (string): ID único del cliente
  - `businessId` (string): ID único del negocio
- **Meta**: `{ requiresAuth: true }`
- **Ejemplo**: `/client/507f1f77bcf86cd799439011/business/507f1f77bcf86cd799439012`

---

## 📊 Parámetros de Ruta

### Parámetros Dinámicos

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `clientId` | string | MongoDB ObjectId del cliente | `507f1f77bcf86cd799439011` |
| `businessId` | string | MongoDB ObjectId del negocio | `507f1f77bcf86cd799439012` |

### Validación de Parámetros

```typescript
// Ejemplo de validación en componente
import { useRoute } from 'vue-router'

const route = useRoute()
const clientId = route.params.clientId as string

// Validar formato MongoDB ObjectId
const isValidObjectId = (id: string): boolean => {
  return /^[0-9a-fA-F]{24}$/.test(id)
}

if (!isValidObjectId(clientId)) {
  // Manejar error o redirigir
  router.push('/dashboard')
}
```

---

## 🏷️ Meta Información

### Estructura Meta

Cada ruta puede incluir meta información adicional:

```typescript
interface RouteMeta {
  requiresAuth: boolean          // Requiere autenticación
  title?: string                 // Título de la página
  breadcrumb?: string            // Texto para breadcrumb
  permissions?: string[]         // Permisos requeridos
}
```

### Meta por Ruta

| Ruta | Meta.requiresAuth | Meta.title | Notas |
|------|-------------------|------------|--------|
| `/` | false | "Inicio" | Redirige si está autenticado |
| `/login` | false | "Iniciar Sesión" | - |
| `/dashboard` | true | "Dashboard" | - |
| `/client/:id` | true | "Cliente" | Título dinámico |
| `/client/:id/businesses` | true | "Negocios" | Título dinámico |
| `/client/:id/business/:id` | true | "Negocio" | Título dinámico |

---

## 🧭 Navegación

### Navegación Programática

```typescript
import { useRouter } from 'vue-router'

const router = useRouter()

// Navegación simple
router.push('/dashboard')

// Navegación con parámetros
router.push({
  name: 'businessDetails',
  params: {
    clientId: '507f1f77bcf86cd799439011',
    businessId: '507f1f77bcf86cd799439012'
  }
})

// Navegación con query params
router.push({
  path: '/dashboard',
  query: { tab: 'clients', page: '2' }
})

// Reemplazar historial (sin agregar al stack)
router.replace('/login')

// Navegación hacia atrás
router.go(-1)
```

### Navegación en Templates

```vue
<!-- Navegación simple -->
<router-link to="/dashboard">Dashboard</router-link>

<!-- Navegación con parámetros -->
<router-link 
  :to="{
    name: 'businessDetails',
    params: { 
      clientId: client._id,
      businessId: business._id 
    }
  }"
>
  Ver Negocio
</router-link>

<!-- Navegación con query -->
<router-link 
  :to="{
    path: '/dashboard',
    query: { search: searchTerm }
  }"
>
  Buscar
</router-link>
```

---

## 🛡️ Guards de Ruta

### Guard Global - beforeEach

**Archivo**: `src/router/index.ts`

```typescript
router.beforeEach((to, from, next) => {
  const isLoggedIn = authService.isAuthenticated()

  // Redirigir a dashboard si ya está autenticado y va a la raíz
  if (to.path === '/' && isLoggedIn) {
    next('/dashboard')
    return
  }

  // Si la ruta requiere autenticación y no está autenticado
  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/login')
    return
  }

  next()
})
```

### Lógica de Protección

1. **Verificación de autenticación**: Se verifica si hay token en localStorage
2. **Redirección inteligente**: 
   - Usuarios autenticados que van a `/` → `/dashboard`
   - Usuarios no autenticados que van a rutas protegidas → `/login`
3. **Sin bucles**: La lógica previene redirecciones infinitas

---

## 🧩 Componentes de Ruta

### Lazy Loading

Todos los componentes de ruta utilizan lazy loading para optimizar el rendimiento:

```typescript
// Lazy loading con import dinámico
component: () => import('../views/DashboardView.vue')

// Con webpack chunk names
component: () => import(/* webpackChunkName: "dashboard" */ '../views/DashboardView.vue')
```

### Estructura de Componentes

```
src/views/
├── HomeView.vue              # Página de inicio
├── LoginView.vue             # Formulario de login
├── DashboardView.vue         # Dashboard principal
├── client.vue               # Detalles de cliente
├── businesses/
│   ├── index.vue            # Lista de negocios
│   └── business.vue         # Detalles de negocio
└── Dashboard/
    └── [componentes del dashboard]
```

---

## 🔄 Flujo de Navegación

### Flujo Principal

```
1. Usuario visita /
   ↓ (si no autenticado)
2. Login (/login)
   ↓ (credenciales válidas)
3. Dashboard (/dashboard)
   ↓
4. Lista de Clientes
   ↓ (click en cliente)
5. Detalles del Cliente (/client/:id)
   ↓ (ver negocios)
6. Lista de Negocios (/client/:id/businesses)
   ↓ (click en negocio)
7. Detalles del Negocio (/client/:id/business/:id)
```

### Flujo de Búsqueda

```
Dashboard → Search → Client Details → Business Details
```

---

## 🎯 Breadcrumbs

### Estructura de Breadcrumbs

```typescript
// Ejemplo de breadcrumbs dinámicos
const breadcrumbs = computed(() => [
  { text: 'Dashboard', to: '/dashboard' },
  { 
    text: 'Clientes', 
    to: '/dashboard?tab=clients' 
  },
  { 
    text: client.value?.name || 'Cliente', 
    to: `/client/${clientId}` 
  },
  { 
    text: 'Negocios', 
    to: `/client/${clientId}/businesses` 
  },
  { 
    text: business.value?.name || 'Negocio', 
    to: `/client/${clientId}/business/${businessId}` 
  }
])
```

---

## 🚨 Manejo de Errores de Ruta

### Ruta 404

```typescript
// Agregar al final de las rutas
{
  path: '/:pathMatch(.*)*',
  name: 'NotFound',
  component: () => import('../views/NotFoundView.vue')
}
```

### Error Handling

```typescript
// En componentes de ruta
onMounted(async () => {
  try {
    const clientId = route.params.clientId as string
    await loadClient(clientId)
  } catch (error) {
    console.error('Error loading client:', error)
    router.push('/dashboard')
  }
})
```

---

## 📱 Responsive Navigation

### Breakpoints

```scss
// Variables de navegación responsive
$mobile: 768px;
$tablet: 1024px;
$desktop: 1200px;

// Navegación móvil
@media (max-width: $mobile) {
  .navigation {
    flex-direction: column;
    padding: 1rem;
  }
}
```

### Menú Móvil

```vue
<!-- Componente de navegación móvil -->
<template>
  <nav class="mobile-nav" v-if="isMobile">
    <router-link 
      v-for="route in mobileRoutes" 
      :key="route.path"
      :to="route.path"
      class="nav-item"
    >
      {{ route.title }}
    </router-link>
  </nav>
</template>
```

---

## 🧪 Testing de Rutas

### Pruebas Unitarias

```typescript
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '@/views/DashboardView.vue'

test('redirects to login when not authenticated', async () => {
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/dashboard', component: DashboardView, meta: { requiresAuth: true } },
      { path: '/login', component: { template: 'Login' } }
    ]
  })
  
  router.push('/dashboard')
  await router.isReady()
  
  expect(router.currentRoute.value.path).toBe('/login')
})
```

---

## 📊 Analytics de Navegación

### Tracking de Rutas

```typescript
// Ejemplo con Google Analytics
router.afterEach((to) => {
  if (window.gtag) {
    window.gtag('config', 'GA_MEASUREMENT_ID', {
      page_path: to.path
    })
  }
})
```

### Métricas de Rendimiento

```typescript
// Medir tiempo de carga de rutas
router.beforeEach((to, from, next) => {
  const start = performance.now()
  
  next()
  
  router.afterEach(() => {
    const end = performance.now()
    console.log(`Route ${to.path} loaded in ${end - start}ms`)
  })
})
```