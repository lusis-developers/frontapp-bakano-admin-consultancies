<script setup lang="ts">
import { watch, type PropType } from 'vue';
import type { Business } from '@/types/business.interface';
import { useForm, Field, ErrorMessage } from 'vee-validate';
import * as yup from 'yup';

// --- PROPS (con la nueva prop isLoading) ---
const props = defineProps({
  business: {
    type: Object as PropType<Business>,
    required: true,
  },
  isVisible: {
    type: Boolean,
    required: true,
  },
  // 👇 Recibimos el estado de carga del padre
  isLoading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', payload: Partial<Business>): void;
}>();

// --- LÓGICA DEL FORMULARIO (sin cambios) ---
const validationSchema = yup.object({
  name: yup.string().required('El nombre es requerido'),
  ruc: yup.string(),
  phone: yup.string(),
  email: yup.string().email('Debe ser un email válido'),
  address: yup.string(),
});

const { handleSubmit, resetForm } = useForm<Partial<Business>>({
  validationSchema,
  initialValues: {},
});

watch(() => props.isVisible, (newVal) => {
  if (newVal && !props.isLoading) { // No resetees si se abre mientras carga
    resetForm({
      values: {
        name: props.business.name,
        ruc: props.business.ruc,
        phone: props.business.phone,
        email: props.business.email,
        address: props.business.address,
      },
    });
  }
});

const onSubmit = handleSubmit((formValues) => {
  emit('save', formValues);
});
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isVisible" class="dialog-overlay" @mousedown.self="!isLoading && emit('close')">
        <Transition name="pop" appear>
          <div v-if="isVisible" class="dialog-panel" role="dialog" aria-modal="true">
            <header class="dialog-header">
              <h3 class="dialog-title">Editando Negocio</h3>
              <button @click="emit('close')" class="close-btn" :disabled="isLoading" aria-label="Cerrar">&times;</button>
            </header>
            <fieldset :disabled="isLoading" class="form-fieldset">
              <form @submit="onSubmit" class="edit-form">
                <div class="form-field">
                  <label for="name">Nombre del Negocio *</label>
                  <Field name="name" type="text" id="name" class="form-input" />
                  <ErrorMessage name="name" class="error-text" />
                </div>
                <div class="form-field"><label for="ruc">RUC</label><Field name="ruc" type="text" id="ruc" class="form-input" /></div>
                <div class="form-field"><label for="email">Email de Contacto</label><Field name="email" type="email" id="email" class="form-input" /><ErrorMessage name="email" class="error-text" /></div>
                <div class="form-field"><label for="phone">Teléfono</label><Field name="phone" type="text" id="phone" class="form-input" /></div>
                <div class="form-field full-width"><label for="address">Dirección</label><Field name="address" type="text" id="address" class="form-input" /></div>
                
                <div class="dialog-actions full-width">
                  <button type="button" @click="emit('close')" class="btn btn-secondary" :disabled="isLoading">Cancelar</button>
                  
                  <button type="submit" class="btn btn-primary" :disabled="isLoading">
                    <span v-if="isLoading">
                      <i class="fas fa-spinner fa-spin"></i> Guardando...
                    </span>
                    <span v-else>Guardar Cambios</span>
                  </button>
                </div>
              </form>
            </fieldset>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>


<style scoped lang="scss">
@use '@/styles/index.scss' as *;

/* --- Contenedor y Fondo con Desenfoque --- */
.dialog-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba($BAKANO-DARK, 0.5);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1rem;
}

/* --- Panel del Modal --- */
.dialog-panel {
  background: $white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 600px;
  overflow: hidden; // Para que el borde redondeado afecte a los hijos
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid $BAKANO-LIGHT;

  .dialog-title {
    font-family: $font-principal;
    font-size: 1.25rem;
    font-weight: 600;
    color: $BAKANO-DARK;
    margin: 0;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 1.8rem;
    color: $BAKANO-DARK;
    cursor: pointer;
    line-height: 1;
    padding: 0;
    transition: color 0.2s ease;

    &:hover:not(:disabled) {
      color: $BAKANO-PINK;
    }
  }
}

// Deshabilita todo el formulario cuando está cargando
.form-fieldset {
  border: none;
  padding: 0;
  margin: 0;
  transition: opacity 0.2s ease;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

/* --- Formulario de Edición (Mobile First) --- */
.edit-form {
  padding: 1.5rem;
  display: grid;
  grid-template-columns: 1fr; // Una columna en móvil
  gap: 1.25rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label {
    font-family: $font-secondary;
    font-weight: 500;
    font-size: 0.9rem;
    color: rgba($BAKANO-DARK, 0.8);
  }

  .form-input {
    font-family: $font-secondary;
    padding: 0.8rem 1rem;
    border-radius: 8px;
    border: 1px solid $BAKANO-LIGHT;
    background-color: lighten($BAKANO-LIGHT, 3%);
    font-size: 1rem;
    color: $BAKANO-DARK;
    transition: all 0.2s ease;

    &:focus {
      outline: none;
      border-color: $BAKANO-PURPLE;
      background-color: $white;
      box-shadow: 0 0 0 3px $overlay-purple;
    }
  }

  .error-text {
    font-size: 0.85rem;
    color: $BAKANO-PINK;
    font-weight: 500;
  }
}

.full-width {
  grid-column: 1 / -1; // Ocupa todo el ancho en el grid
}

/* --- Acciones del Diálogo --- */
.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1.25rem;
  margin-top: 0.25rem;
  border-top: 1px solid $BAKANO-LIGHT;
}

.btn {
  font-family: $font-principal;
  font-weight: 600;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
  }

  &:disabled {
    cursor: not-allowed;
  }
}

.btn-primary {
  background-color: $BAKANO-PURPLE;
  color: $white;

  &:hover:not(:disabled) {
    box-shadow: 0 4px 15px rgba($BAKANO-PURPLE, 0.3);
  }

  &:disabled {
    background-color: lighten($BAKANO-PURPLE, 15%);
  }

  .fa-spinner {
    margin-right: 0.5rem;
  }
}

.btn-secondary {
  background-color: $BAKANO-LIGHT;
  color: $BAKANO-DARK;

  &:hover:not(:disabled) {
    background-color: darken($BAKANO-LIGHT, 8%);
  }

  &:disabled {
    background-color: $BAKANO-LIGHT;
    color: rgba($BAKANO-DARK, 0.4);
  }
}

/* --- Layout para Escritorio --- */
@media (min-width: 640px) {
  .edit-form {
    grid-template-columns: 1fr 1fr; // Dos columnas
  }
}

/* --- Transiciones --- */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.pop-enter-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.pop-leave-active {
  transition: all 0.2s ease-in-out;
}

.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

// Animación para el spinner si no la tienes global
@keyframes fa-spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.fa-spin {
  animation: fa-spin 1s infinite linear;
}
</style>