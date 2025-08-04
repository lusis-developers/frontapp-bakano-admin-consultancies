# Bakano Admin - Panel de Administración

Panel de administración para la gestión de clientes y negocios del sistema Bakano. Aplicación web construida con Vue 3, TypeScript y Vite.

## 📋 Tabla de Contenidos

- [Características](#características)
- [Tecnologías](#tecnologías)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Uso](#uso)
- [Desarrollo](#desarrollo)
- [Construcción](#construcción)
- [Despliegue](#despliegue)
- [APIs y Servicios](#apis-y-servicios)
- [Autenticación](#autenticación)
- [Contribución](#contribución)

## ✨ Características

- **Autenticación segura** con credenciales de administrador
- **Gestión de clientes** con información detallada y búsqueda avanzada
- **Gestión de negocios** por cliente con administradores asignados
- **Control de reuniones** y asignación a clientes
- **Dashboard interactivo** con visualización de datos
- **Sistema de notificaciones** toast para feedback al usuario
- **Internacionalización** en español
- **Diseño responsivo** para diferentes dispositivos

## 🛠️ Tecnologías

### Frontend
- **Vue 3** - Framework progresivo de JavaScript
- **TypeScript** - Superset de JavaScript con tipado estático
- **Vite** - Build tool rápido y moderno
- **Vue Router** - Sistema de rutas para aplicaciones SPA
- **Pinia** - Gestión de estado global
- **Axios** - Cliente HTTP para peticiones a la API
- **Chart.js** - Biblioteca de gráficos interactivos
- **Vee-Validate** - Validación de formularios
- **Yup** - Esquemas de validación
- **Date-fns** - Manipulación de fechas

### Estilos y UI
- **SCSS/SASS** - Preprocesador CSS
- **Prettier** - Formateador de código
- **Fuentes personalizadas** integradas

## 📋 Requisitos Previos

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0 (gestor de paquetes)
- **Git** para control de versiones

## 🚀 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone [URL_DEL_REPOSITORIO]
   cd app-bakano-admin
   ```

2. **Instalar dependencias**
   ```bash
   pnpm install
   ```

3. **Configurar variables de entorno** (si es necesario)
   ```bash
   cp .env.example .env
   # Editar .env con las configuraciones necesarias
   ```

## ⚙️ Configuración

### Variables de Entorno

El proyecto puede requerir las siguientes variables de entorno:

```env
VITE_API_BASE_URL=https://api.bakano.com
VITE_APP_NAME=Bakano Admin
```

### Configuración de TypeScript

El proyecto utiliza TypeScript con las siguientes configuraciones:

- **tsconfig.json**: Configuración principal con referencias a archivos específicos
- **tsconfig.app.json**: Configuración para la aplicación Vue
- **tsconfig.node.json**: Configuración para el entorno de Node.js

### Configuración de Vite

El archivo `vite.config.ts` incluye:

- Alias `@` para la carpeta `src/`
- Soporte para archivos SCSS
- Plugin de Vue DevTools para desarrollo
- Configuración optimizada para desarrollo y producción

## 📁 Estructura del Proyecto

```
src/
├── assets/              # Recursos estáticos (imágenes, logos)
├── components/          # Componentes Vue reutilizables
│   ├── Wizards/       # Componentes de asistentes paso a paso
│   ├── actions/       # Acciones y botones
│   ├── charts/        # Gráficos y visualizaciones
│   ├── globals/       # Componentes globales
│   ├── modals/        # Ventanas modales
│   └── shared/        # Componentes compartidos
├── composables/       # Composables de Vue 3
│   ├── useConfirmationDialog.ts
│   └── useToast.ts
├── enums/             # Enumeraciones TypeScript
│   ├── businessType.enum.ts
│   ├── meetingStatus.enum.ts
│   └── payMethod.enum.ts
├── i18n/              # Internacionalización
│   └── es.ts          # Traducciones en español
├── router/            # Configuración de rutas
│   └── index.ts
├── services/          # Servicios para comunicación con API
│   ├── authService.ts
│   ├── businessService.ts
│   ├── clientService.ts
│   ├── httpBase.ts
│   └── paymentsService.ts
├── stores/            # Stores de Pinia para gestión de estado
│   ├── clientAndBusiness.ts
│   ├── counter.ts
│   ├── payments.ts
│   └── search.ts
├── styles/            # Estilos globales y variables
│   ├── colorVariables.module.scss
│   ├── fonts/
│   ├── fonts.modules.scss
│   ├── global.scss
│   └── index.scss
├── types/             # Definiciones de tipos TypeScript
│   ├── business.interface.ts
│   ├── client.inteface.ts
│   ├── manager.interface.ts
│   ├── manualTransfer.interface.ts
│   ├── meeting.interface.ts
│   ├── responses/
│   └── transaction.interface.ts
└── views/             # Vistas principales de la aplicación
    ├── Dashboard/
    ├── DashboardView.vue
    ├── HomeView.vue
    ├── LoginView.vue
    ├── businesses/
    ├── client/
    └── client.vue
```

## 🎯 Uso

### Desarrollo Local

1. **Iniciar servidor de desarrollo**
   ```bash
   pnpm dev
   ```

2. **Abrir en el navegador**
   ```
   http://localhost:5173
   ```

### Credenciales de Acceso

Para acceder al sistema de administración:
- **Email**: admin@bakano.ec
- **Contraseña**: Bakano2024!

### Funcionalidades Principales

1. **Dashboard**: Vista general con estadísticas y gráficos
2. **Gestión de Clientes**:
   - Ver lista de clientes
   - Ver detalles de cliente individual
   - Búsqueda avanzada de clientes
   - Asignar reuniones a clientes

3. **Gestión de Negocios**:
   - Ver negocios por cliente
   - Administrar información de negocios
   - Gestionar administradores de negocio
   - Eliminar negocios

4. **Reuniones**:
   - Ver reuniones no asignadas
   - Asignar reuniones a clientes
   - Confirmar reuniones de estrategia
   - Completar reuniones de estrategia de datos

## 🛠️ Desarrollo

### Scripts Disponibles

```bash
# Desarrollo con hot-reload
pnpm dev

# Construcción para producción
pnpm build

# Previsualización de producción
pnpm preview

# Verificación de tipos TypeScript
pnpm type-check

# Formateo de código
pnpm format
```

### Estructura de Código

#### Servicios

Los servicios están ubicados en `src/services/` y manejan la comunicación con la API:

- **AuthService**: Autenticación y gestión de tokens
- **ClientService**: Operaciones relacionadas con clientes
- **BusinessService**: Gestión de negocios y administradores
- **PaymentsService**: Procesamiento de pagos
- **HttpBase**: Configuración base para peticiones HTTP

#### Stores de Estado

Los stores de Pinia están en `src/stores/`:

- **clientAndBusiness**: Gestión de clientes y negocios
- **payments**: Gestión de pagos
- **search**: Búsqueda y filtros
- **counter**: Ejemplo de store básico

#### Tipos y Interfaces

Los tipos TypeScript están organizados en:

- **Interfaces**: Definiciones de objetos (Client, Business, Meeting, etc.)
- **Enums**: Valores constantes y categorías
- **Responses**: Estructuras de respuesta de la API

## 📦 Construcción

### Producción

```bash
pnpm build
```

Esto generará los archivos optimizados en la carpeta `dist/`.

### Análisis de Bundle

```bash
pnpm preview
```

## 🚀 Despliegue

### Netlify

El proyecto está configurado para despliegue en Netlify con el archivo `_redirects`.

### Variables de Entorno para Producción

Asegúrate de configurar las variables de entorno en tu plataforma de despliegue:

```env
VITE_API_BASE_URL=https://api-prod.bakano.com
```

## 🔌 APIs y Servicios

### Endpoints Principales

#### Autenticación
- `POST /login` - Inicio de sesión

#### Clientes
- `GET /clients` - Listar todos los clientes
- `GET /client/:id` - Detalles de cliente
- `GET /search` - Búsqueda de clientes
- `POST /client/:id/confirm-strategy-meeting` - Confirmar reunión
- `POST /client/:id/complete-data-strategy-meeting` - Completar reunión

#### Negocios
- `PATCH /business/edit/:id` - Editar negocio
- `GET /business/:id/managers` - Obtener administradores
- `POST /business/:id/managers` - Agregar administrador
- `DELETE /business/:id/managers/:managerId` - Eliminar administrador
- `DELETE /business/:id` - Eliminar negocio

#### Reuniones
- `GET /client/meeting/unassigned` - Reuniones no asignadas
- `PATCH /client/meetings/:id/asign` - Asignar reunión
- `DELETE /meeting/:id` - Eliminar reunión

## 🔐 Autenticación

El sistema utiliza autenticación basada en JWT (JSON Web Tokens):

1. **Login**: El usuario ingresa credenciales
2. **Token**: Se genera un token JWT válido
3. **Almacenamiento**: El token se guarda en localStorage
4. **Validación**: Se verifica en cada ruta protegida
5. **Logout**: Se elimina el token del almacenamiento

### Rutas Protegidas

Las siguientes rutas requieren autenticación:
- `/dashboard`
- `/client/:clientId`
- `/client/:clientId/businesses`
- `/client/:clientId/business/:businessId`

## 🤝 Contribución

### Flujo de Trabajo

1. **Fork** el repositorio
2. **Crear** una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. **Abrir** un Pull Request

### Estándares de Código

- **TypeScript**: Uso obligatorio para type safety
- **Prettier**: Formato de código automático
- **Nombres**: Inglés para código, español para UI
- **Commits**: Mensajes descriptivos en español

### Estructura de Commits

```
tipo(alcance): descripción breve

- feat: Nueva funcionalidad
- fix: Corrección de bugs
- docs: Documentación
- style: Formato y estilos
- refactor: Refactorización de código
- test: Añadir tests
```

## 📞 Soporte

Para soporte técnico o preguntas sobre el proyecto:

- **Email**: soporte@bakano.com
- **Documentación**: [docs.bakano.com](https://docs.bakano.com)

## 📄 Licencia

Este proyecto es propiedad de Bakano. Todos los derechos reservados.

---

**Desarrollado con ❤️ por el equipo Bakano**
