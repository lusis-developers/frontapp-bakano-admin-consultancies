<script setup lang="ts">
import { ref } from 'vue'
import { useMVP } from '../../composables/useMVP'
import type { ICreateMVPAccountRequest } from '../../types/mvp.interface'

const props = defineProps<{
  clientId: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'created'): void
}>()

// Composables
const { createMVPAccount, isLoading } = useMVP()

// Estado del formulario
const form = ref<ICreateMVPAccountRequest>({
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  clientId: props.clientId,
  role: 'client'
})

// Estado de errores
const errors = ref<Record<string, string>>({})
const generalError = ref('')

// Validar formulario
function validateForm(): boolean {
  errors.value = {}
  let isValid = true

  if (!form.value.email) {
    errors.value.email = 'El email es requerido'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    errors.value.email = 'El email no es válido'
    isValid = false
  }

  if (!form.value.password) {
    errors.value.password = 'La contraseña es requerida'
    isValid = false
  } else if (form.value.password.length < 6) {
    errors.value.password = 'La contraseña debe tener al menos 6 caracteres'
    isValid = false
  }

  if (!form.value.firstName) {
    errors.value.firstName = 'El nombre es requerido'
    isValid = false
  }

  if (!form.value.lastName) {
    errors.value.lastName = 'El apellido es requerido'
    isValid = false
  }

  return isValid
}

// Manejar envío del formulario
async function handleSubmit() {
  if (!validateForm()) return

  try {
    generalError.value = ''
    // Aseguramos que estamos usando el ID del cliente correcto
    form.value.clientId = props.clientId
    await createMVPAccount(props.clientId, form.value)
    emit('created')
  } catch (err: any) {
    console.error('Error al crear cuenta MVP:', err)
    if (err && typeof err === 'object') {
      if ('message' in err) {
        generalError.value = err.message as string
      } else if ('status' in err && err.status === 409) {
        generalError.value = 'Este cliente ya tiene una cuenta StoryBrand'
      } else {
        generalError.value = 'Error al crear la cuenta MVP'
      }
    } else {
      generalError.value = 'Error al crear la cuenta MVP'
    }
  }
}

// Cerrar modal
function closeModal() {
  if (isLoading.value) return
  emit('close')
}
</script>

<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Crear Cuenta MVP</h2>
        <button class="close-button" @click="closeModal" :disabled="isLoading" title="Cerrar">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="mvp-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            type="email" 
            id="email" 
            v-model="form.email" 
            :class="{ 'input-error': errors.email }"
            :disabled="isLoading"
          />
          <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
        </div>

        <div class="form-group">
          <label for="password">Contraseña</label>
          <input 
            type="password" 
            id="password" 
            v-model="form.password" 
            :class="{ 'input-error': errors.password }"
            :disabled="isLoading"
          />
          <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="firstName">Nombre</label>
            <input 
              type="text" 
              id="firstName" 
              v-model="form.firstName" 
              :class="{ 'input-error': errors.firstName }"
              :disabled="isLoading"
            />
            <span v-if="errors.firstName" class="error-message">{{ errors.firstName }}</span>
          </div>

          <div class="form-group">
            <label for="lastName">Apellido</label>
            <input 
              type="text" 
              id="lastName" 
              v-model="form.lastName" 
              :class="{ 'input-error': errors.lastName }"
              :disabled="isLoading"
            />
            <span v-if="errors.lastName" class="error-message">{{ errors.lastName }}</span>
          </div>
        </div>

        <div v-if="generalError" class="general-error">
          <i class="fas fa-exclamation-triangle error-icon"></i>
          <span>{{ generalError }}</span>
        </div>

        <div class="form-actions">
          <button 
            type="button" 
            class="btn-cancel" 
            @click="closeModal"
            :disabled="isLoading"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            class="btn-primary" 
            :disabled="isLoading"
          >
            <i v-if="isLoading" class="fas fa-spinner fa-spin"></i>
            <span v-else>Crear Cuenta</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../../styles/index.scss' as *;

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba($BAKANO-DARK, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: $white;
  border-radius: 12px;
  width: 90%;
  max-width: 450px;
  max-height: 90vh;
  overflow-y: auto;
  overflow-x: hidden;
  box-shadow: 0 10px 25px rgba($BAKANO-DARK, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid $BAKANO-LIGHT;
  
  h2 {
    margin: 0;
    font-size: 1.5rem;
    color: $BAKANO-DARK;
    font-weight: 600;
  }
  
  .close-button {
    background: none;
    border: none;
    color: rgba($BAKANO-DARK, 0.5);
    font-size: 1.25rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    width: 36px;
    height: 36px;
    
    &:hover:not(:disabled) {
      background-color: rgba($BAKANO-DARK, 0.1);
      color: $BAKANO-DARK;
    }
    
    &:active:not(:disabled) {
      background-color: rgba($BAKANO-DARK, 0.2);
      transform: scale(0.95);
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

.mvp-form {
  padding: 1.25rem 1rem;
}

.form-group {
  margin-bottom: 1rem;
  width: 100%;
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: $BAKANO-DARK;
    font-size: 0.95rem;
    font-family: $font-principal;
  }
  
  input {
    width: 100%;
    padding: 0.75rem 0.75rem;
    border: 1px solid rgba($BAKANO-DARK, 0.2);
    border-radius: 8px;
    font-size: 0.95rem;
    transition: all 0.2s ease;
    font-family: $font-secondary;
    color: $BAKANO-DARK;
    box-sizing: border-box;
    
    &:focus {
      outline: none;
      border-color: $BAKANO-PURPLE;
      box-shadow: 0 0 0 3px rgba($BAKANO-PURPLE, 0.1);
    }
    
    &.input-error {
      border-color: $BAKANO-PINK;
      box-shadow: 0 0 0 2px rgba($BAKANO-PINK, 0.1);
    }
    
    &:disabled {
      background-color: rgba($BAKANO-LIGHT, 0.5);
      cursor: not-allowed;
      opacity: 0.7;
    }
  }
  
  .error-message {
    display: block;
    color: $BAKANO-PINK;
    font-size: 0.85rem;
    margin-top: 0.5rem;
  }
}

.form-row {
  display: flex;
  gap: 0.75rem;
  
  @media (max-width: 600px) {
    flex-direction: column;
    gap: 0;
  }
}

.general-error {
  background-color: lighten($BAKANO-PINK, 42%);
  color: $BAKANO-PINK;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border: 1px solid lighten($BAKANO-PINK, 30%);
  
  .error-icon {
    font-size: 1.2rem;
    flex-shrink: 0;
  }
  
  span {
    flex: 1;
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  
  button {
    padding: 0.7rem 1.2rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-size: 0.95rem;
    
    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  }
  
  .btn-cancel {
    background-color: transparent;
    border: 1px solid rgba($BAKANO-DARK, 0.2);
    color: $BAKANO-DARK;
    min-width: 100px;
    
    &:hover:not(:disabled) {
      background-color: rgba($BAKANO-DARK, 0.05);
      border-color: rgba($BAKANO-DARK, 0.3);
    }
    
    &:active:not(:disabled) {
      background-color: rgba($BAKANO-DARK, 0.1);
      transform: scale(0.98);
    }
  }
  
  .btn-primary {
    background-color: $BAKANO-PURPLE;
    color: $white;
    border: none;
    min-width: 120px;
    
    &:hover:not(:disabled) {
      background-color: darken($BAKANO-PURPLE, 5%);
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba($BAKANO-PURPLE, 0.2);
    }
    
    &:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: 0 2px 4px rgba($BAKANO-PURPLE, 0.1);
    }
  }
}
</style>