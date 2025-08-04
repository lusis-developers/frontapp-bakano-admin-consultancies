# 🧩 Documentación de Componentes

Documentación completa de todos los componentes Vue reutilizables en la aplicación Bakano Admin.

## 📚 Índice de Componentes

- [Estructura de Componentes](#estructura-de-componentes)
- [Componentes Globales](#componentes-globales)
- [Componentes de Dashboard](#componentes-de-dashboard)
- [Componentes de Formularios](#componentes-de-formularios)
- [Componentes de Visualización](#componentes-de-visualización)
- [Componentes de Acciones](#componentes-de-acciones)
- [Componentes Modales](#componentes-modales)
- [Estilos y Temas](#estilos-y-temas)

---

## 🏗️ Estructura de Componentes

### Organización por Carpetas

```
src/components/
├── Wizards/           # Asistentes paso a paso
├── actions/           # Botones y acciones
├── charts/            # Gráficos y visualizaciones
├── globals/           # Componentes globales
├── modals/            # Ventanas modales
└── shared/            # Componentes compartidos
```

### Convenciones de Nombres

- **PascalCase**: Nombres de componentes (Ej: `ClientCard.vue`)
- **kebab-case**: Nombres de archivos (Ej: `client-card.vue`)
- **Prefijos**: Descriptivos del propósito (Ej: `BaseButton`, `ChartLine`)

---

## 🌍 Componentes Globales

### BaseButton

**Ubicación**: `src/components/globals/BaseButton.vue`

Botón reutilizable con múltiples variantes.

#### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `variant` | String | `'primary'` | `primary`, `secondary`, `danger`, `success` |
| `size` | String | `'medium'` | `small`, `medium`, `large` |
| `disabled` | Boolean | `false` | Estado deshabilitado |
| `loading` | Boolean | `false` | Estado de carga |
| `fullWidth` | Boolean | `false` | Ancho completo |

#### Slots

- **default**: Contenido del botón
- **icon**: Icono opcional

#### Ejemplos de Uso

```vue
<!-- Botón primario -->
<BaseButton @click="handleSave">Guardar</BaseButton>

<!-- Botón de peligro con icono -->
<BaseButton variant="danger" size="small">
  <template #icon>
    <TrashIcon />
  </template>
  Eliminar
</BaseButton>

<!-- Botón de carga -->
<BaseButton :loading="isLoading" disabled>
  Procesando...
</BaseButton>
```

### BaseInput

**Ubicación**: `src/components/globals/BaseInput.vue`

Campo de entrada reutilizable con validación.

#### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `modelValue` | String/Number | `''` | Valor del input |
| `label` | String | `''` | Etiqueta del campo |
| `type` | String | `'text'` | Tipo de input |
| `placeholder` | String | `''` | Placeholder |
| `error` | String | `''` | Mensaje de error |
| `required` | Boolean | `false` | Campo obligatorio |

#### Eventos

- **update:modelValue**: Actualización del valor
- **blur**: Evento de pérdida de foco
- **focus**: Evento de enfoque

#### Ejemplos de Uso

```vue
<BaseInput
  v-model="form.email"
  label="Email"
  type="email"
  placeholder="ejemplo@correo.com"
  :error="errors.email"
  required
/>
```

---

## 📊 Componentes de Dashboard

### DashboardStats

**Ubicación**: `src/components/charts/DashboardStats.vue`

Muestra estadísticas clave del dashboard.

#### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `stats` | Array | `[]` | Array de objetos estadísticos |
| `loading` | Boolean | `false` | Estado de carga |

#### Estructura de Stats

```typescript
interface StatItem {
  title: string
  value: string | number
  icon: string
  trend?: number
  color: string
}
```

### ChartLine

**Ubicación**: `src/components/charts/ChartLine.vue`

Gráfico de líneas usando Chart.js.

#### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `data` | Array | `[]` | Datos del gráfico |
| `labels` | Array | `[]` | Etiquetas del eje X |
| `title` | String | `''` | Título del gráfico |
| `color` | String | `'#3B82F6'` | Color principal |

#### Ejemplo de Uso

```vue
<ChartLine
  :data="[12, 19, 3, 5, 2, 3]"
  :labels="['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun']"
  title="Ventas Mensuales"
  color="#10B981"
/>
```

---

## 📝 Componentes de Formularios

### ClientForm

**Ubicación**: `src/components/shared/ClientForm.vue`

Formulario para crear/editar clientes.

#### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `client` | Object | `null` | Cliente existente para edición |
| `mode` | String | `'create'` | `create` o `edit` |

#### Eventos

- **submit**: Cuando se envía el formulario
- **cancel**: Cuando se cancela la operación

#### Estructura del Formulario

```vue
<ClientForm
  :client="editingClient"
  mode="edit"
  @submit="handleClientUpdate"
  @cancel="closeModal"
/>
```

### BusinessForm

**Ubicación**: `src/components/shared/BusinessForm.vue`

Formulario para gestionar información de negocios.

#### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `business` | Object | `null` | Negocio existente |
| `clientId` | String | `''` | ID del cliente propietario |

---

## 👥 Componentes de Visualización

### ClientCard

**Ubicación**: `src/components/shared/ClientCard.vue`

Tarjeta visual para mostrar información básica de un cliente.

#### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `client` | Object | `{}` | Objeto cliente |
| `showActions` | Boolean | `true` | Mostrar botones de acción |

#### Slots

- **actions**: Botones personalizados de acción

#### Ejemplo de Uso

```vue
<ClientCard
  v-for="client in clients"
  :key="client._id"
  :client="client"
  @click="viewClientDetails(client._id)"
>
  <template #actions>
    <BaseButton size="small" @click="editClient(client)">
      Editar
    </BaseButton>
  </template>
</ClientCard>
```

### BusinessList

**Ubicación**: `src/components/shared/BusinessList.vue`

Lista de negocios con funcionalidad de búsqueda y filtrado.

#### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `businesses` | Array | `[]` | Array de negocios |
| `searchable` | Boolean | `true` | Habilitar búsqueda |
| `loading` | Boolean | `false` | Estado de carga |

---

## ⚡ Componentes de Acciones

### ActionButtons

**Ubicación**: `src/components/actions/ActionButtons.vue`

Grupo de botones de acción contextual.

#### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `actions` | Array | `[]` | Array de acciones disponibles |
| `size` | String | `'medium'` | Tamaño de los botones |

#### Estructura de Acción

```typescript
interface Action {
  label: string
  icon?: string
  variant?: string
  action: () => void
  disabled?: boolean
}
```

#### Ejemplo de Uso

```vue
<ActionButtons
  :actions="[
    { label: 'Editar', icon: 'edit', action: editClient },
    { label: 'Eliminar', icon: 'trash', variant: 'danger', action: deleteClient }
  ]"
/>
```

---

## 🪟 Componentes Modales

### ConfirmationModal

**Ubicación**: `src/components/modals/ConfirmationModal.vue`

Modal de confirmación para acciones destructivas.

#### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `show` | Boolean | `false` | Visibilidad del modal |
| `title` | String | `'Confirmar'` | Título del modal |
| `message` | String | `''` | Mensaje de confirmación |
| `confirmText` | String | `'Confirmar'` | Texto del botón confirmar |
| `cancelText` | String | `'Cancelar'` | Texto del botón cancelar |

#### Eventos

- **confirm**: Cuando se confirma la acción
- **cancel**: Cuando se cancela

#### Ejemplo con Composable

```vue
<script setup>
import { useConfirmationDialog } from '@/composables/useConfirmationDialog'

const { showDialog, dialogConfig } = useConfirmationDialog()

const deleteClient = async (client) => {
  const confirmed = await showDialog({
    title: 'Eliminar Cliente',
    message: `¿Está seguro de eliminar a ${client.name}?`,
    confirmText: 'Eliminar',
    variant: 'danger'
  })
  
  if (confirmed) {
    // Proceder con la eliminación
  }
}
</script>
```

### ModalManager

**Ubicación**: `src/components/modals/ModalManager.vue`

Gestor de múltiples modales.

#### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `modals` | Array | `[]` | Lista de modales activos |
| `backdropClose` | Boolean | `true` | Cerrar al hacer click fuera |

---

## 🎨 Estilos y Temas

### Variables CSS

**Archivo**: `src/styles/colorVariables.module.scss`

```scss
// Colores principales
:root {
  --color-primary: #3B82F6;
  --color-secondary: #6B7280;
  --color-success: #10B981;
  --color-danger: #EF4444;
  --color-warning: #F59E0B;
  
  // Colores de fondo
  --color-background: #FFFFFF;
  --color-surface: #F9FAFB;
  --color-border: #E5E7EB;
  
  // Tipografía
  --font-family-primary: 'Inter', system-ui, sans-serif;
  --font-size-base: 16px;
  
  // Espaciados
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
}
```

### Clases de Utilidad

```scss
// Utilidades de espaciado
.u-mb-sm { margin-bottom: var(--spacing-sm); }
.u-mt-lg { margin-top: var(--spacing-lg); }

// Utilidades de texto
.u-text-center { text-align: center; }
.u-text-muted { color: var(--color-secondary); }

// Utilidades de layout
.u-flex { display: flex; }
.u-grid { display: grid; }
.u-hidden { display: none; }
```

---

## 🧪 Testing de Componentes

### Ejemplo de Test Unitario

```typescript
import { mount } from '@vue/test-utils'
import BaseButton from '@/components/globals/BaseButton.vue'

describe('BaseButton', () => {
  it('renders correctly with primary variant', () => {
    const wrapper = mount(BaseButton, {
      props: { variant: 'primary' },
      slots: { default: 'Click me' }
    })
    
    expect(wrapper.text()).toBe('Click me')
    expect(wrapper.classes()).toContain('btn-primary')
  })
  
  it('emits click event', async () => {
    const wrapper = mount(BaseButton)
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })
})
```

---

## 🔄 Composables

### useToast

**Archivo**: `src/composables/useToast.ts`

Gestión de notificaciones toast.

```typescript
const { showToast } = useToast()

// Uso básico
showToast('Operación exitosa', 'success')

// Uso avanzado
showToast({
  message: 'Cliente actualizado',
  type: 'success',
  duration: 3000,
  position: 'top-right'
})
```

### useConfirmationDialog

**Archivo**: `src/composables/useConfirmationDialog.ts`

Gestión de diálogos de confirmación.

```typescript
const { showDialog } = useConfirmationDialog()

const handleDelete = async () => {
  const confirmed = await showDialog({
    title: 'Confirmar eliminación',
    message: '¿Está seguro?',
    variant: 'danger'
  })
  
  if (confirmed) {
    // Proceder con la acción
  }
}
```

---

## 📦 Guía de Implementación

### Crear un Nuevo Componente

1. **Estructura del archivo**:
```vue
<template>
  <div class="component-name">
    <!-- Contenido -->
  </div>
</template>

<script setup lang="ts">
// Imports
import { computed } from 'vue'

// Props con TypeScript
interface Props {
  title: string
  variant?: 'primary' | 'secondary'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary'
})

// Emits
const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

// Lógica
const classes = computed(() => ({
  [`--${props.variant}`]: true
}))
</script>

<style scoped lang="scss">
.component-name {
  // Estilos
}
</style>
```

2. **Registro en componente padre**:
```vue
<script setup>
import NewComponent from '@/components/shared/NewComponent.vue'
</script>
```

---

## 🎯 Mejores Prácticas

### 1. Props y Emits

```typescript
// Bueno: Props tipadas
interface Props {
  user: User
  showDetails?: boolean
}

// Evitar: Props sin tipado
const props = defineProps(['user', 'showDetails'])
```

### 2. Slots

```vue
<!-- Bueno: Slots nombrados -->
<slot name="header" :title="pageTitle" />
<slot name="content" :data="items" />

<!-- Uso -->
<template #header="{ title }">
  <h1>{{ title }}</h1>
</template>
```

### 3. Composables

```typescript
// Bueno: Composables específicos
const { clients, loading, error } = useClients()

// Evitar: Lógica en componentes
const clients = ref([])
const loading = ref(false)
const error = ref(null)
```

### 4. Estilos

```scss
// Bueno: Scoped styles
<style scoped>
.component {
  // Estilos locales
}
</style>

// Evitar: Estilos globales
<style>
.component {
  // Afecta a toda la app
}
</style>
```

---

## 📋 Checklist de Componentes

### Antes de Crear un Componente

- [ ] ¿Está realmente necesario o puedo reusar uno existente?
- [ ] ¿He definido claramente las props y sus tipos?
- [ ] ¿He documentado los eventos emitidos?
- [ ] ¿He considerado los estados de carga y error?
- [ ] ¿He hecho el componente lo suficientemente genérico?

### Después de Crear un Componente

- [ ] ¿He agregado tests unitarios?
- [ ] ¿He documentado el uso en esta guía?
- [ ] ¿He verificado la accesibilidad?
- [ ] ¿He probado en diferentes tamaños de pantalla?