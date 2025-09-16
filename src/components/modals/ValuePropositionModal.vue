<script setup lang="ts">
import { ref, computed } from 'vue'
import { useToast } from '@/composables/useToast'

interface Props {
  isOpen: boolean
  businessName: string
  businessId?: string
}

interface Emits {
  (e: 'close'): void
  (e: 'save', valueProposition: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { triggerToast } = useToast()

// Estado reactivo
const valueProposition = ref<string>('')
const isSaving = ref<boolean>(false)

// Computed properties
const isValidProposition = computed(() =>
  valueProposition.value.trim().length >= 10
)

const characterCount = computed(() => valueProposition.value.length)
const maxCharacters = 500

// Métodos
const handleSave = async (): Promise<void> => {
  if (!isValidProposition.value) {
    triggerToast('La propuesta de valor debe tener al menos 10 caracteres', 'warning')
    return
  }

  isSaving.value = true

  try {
    emit('save', valueProposition.value.trim())
    handleClose()
    triggerToast('Propuesta de valor guardada exitosamente', 'success')
  } catch (error) {
    console.error('Error saving value proposition:', error)
    triggerToast('Error al guardar la propuesta de valor', 'error')
  } finally {
    isSaving.value = false
  }
}

const handleClose = (): void => {
  valueProposition.value = ''
  emit('close')
}

const handleKeydown = (event: KeyboardEvent): void => {
  if (event.key === 'Escape') {
    handleClose()
  }
  if (event.key === 'Enter' && event.ctrlKey && isValidProposition.value) {
    handleSave()
  }
}
</script>

<template>
  <div 
    v-if="isOpen" 
    class="modal-overlay"
    @click.self="handleClose"
    @keydown="handleKeydown"
    tabindex="0"
  >
    <div class="modal-container">
      <div class="modal-header">
        <h3 class="modal-title">
          Compromiso de Valor
        </h3>
        <button 
          class="close-btn"
          @click="handleClose"
          :disabled="isSaving"
          aria-label="Cerrar modal"
        >
          ✕
        </button>
      </div>

      <div class="modal-body">
        <div class="business-info">
          <p class="business-name">
            <strong>Negocio:</strong> {{ businessName }}
          </p>
        </div>

        <div class="form-group">
          <label for="valueProposition" class="form-label">
            ¿Cuál es la propuesta de valor única de este negocio?
          </label>
          <textarea
            id="valueProposition"
            v-model="valueProposition"
            class="form-textarea"
            :class="{ 'error': !isValidProposition && valueProposition.length > 0 }"
            placeholder="Describe qué hace único a este negocio, qué problema resuelve para sus clientes, y por qué deberían elegirlo sobre la competencia..."
            rows="6"
            :maxlength="maxCharacters"
            :disabled="isSaving"
            autofocus
          />
          
          <div class="textarea-footer">
            <span 
              class="character-count"
              :class="{ 'warning': characterCount > maxCharacters * 0.9 }"
            >
              {{ characterCount }}/{{ maxCharacters }}
            </span>
            <span 
              v-if="!isValidProposition && valueProposition.length > 0"
              class="validation-message"
            >
              Mínimo 10 caracteres
            </span>
          </div>
        </div>

        <div class="help-text">
          <p><strong>Consejos:</strong></p>
          <ul>
            <li>Enfócate en los beneficios únicos que ofrece</li>
            <li>Menciona qué problema específico resuelve</li>
            <li>Destaca qué lo diferencia de la competencia</li>
          </ul>
        </div>
      </div>

      <div class="modal-footer">
        <button 
          class="cancel-btn"
          @click="handleClose"
          :disabled="isSaving"
        >
          Cancelar
        </button>
        <button 
          class="save-btn"
          @click="handleSave"
          :disabled="!isValidProposition || isSaving"
          :class="{ 'loading': isSaving }"
        >
          <span v-if="isSaving">Guardando...</span>
          <span v-else>Guardar Propuesta</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-container {
  background: var(--color-white);
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-border-light);
  background: var(--color-background-light);

  .modal-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--color-text-secondary);
    padding: 0.25rem;
    border-radius: 4px;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
      background-color: var(--color-background-hover);
      color: var(--color-text-primary);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.business-info {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: var(--color-background-light);
  border-radius: 8px;
  border-left: 4px solid var(--color-primary);

  .business-name {
    margin: 0;
    color: var(--color-text-primary);
    font-size: 0.95rem;
  }
}

.form-group {
  margin-bottom: 1.5rem;

  .form-label {
    display: block;
    margin-bottom: 0.75rem;
    font-weight: 500;
    color: var(--color-text-primary);
    font-size: 0.95rem;
  }

  .form-textarea {
    width: 100%;
    padding: 0.875rem;
    border: 2px solid var(--color-border);
    border-radius: 8px;
    font-family: inherit;
    font-size: 0.9rem;
    line-height: 1.5;
    resize: vertical;
    min-height: 120px;
    transition: border-color 0.2s ease;

    &:focus {
      outline: none;
      border-color: var(--color-primary);
    }

    &.error {
      border-color: var(--color-error);
    }

    &:disabled {
      background-color: var(--color-background-disabled);
      cursor: not-allowed;
    }

    &::placeholder {
      color: var(--color-text-placeholder);
    }
  }

  .textarea-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 0.5rem;
    font-size: 0.8rem;

    .character-count {
      color: var(--color-text-secondary);

      &.warning {
        color: var(--color-warning);
        font-weight: 500;
      }
    }

    .validation-message {
      color: var(--color-error);
      font-weight: 500;
    }
  }
}

.help-text {
  padding: 1rem;
  background: var(--color-background-info);
  border-radius: 8px;
  border-left: 4px solid var(--color-info);

  p {
    margin: 0 0 0.5rem 0;
    font-weight: 500;
    color: var(--color-text-primary);
    font-size: 0.9rem;
  }

  ul {
    margin: 0;
    padding-left: 1.25rem;

    li {
      margin-bottom: 0.25rem;
      color: var(--color-text-secondary);
      font-size: 0.85rem;
      line-height: 1.4;
    }
  }
}

.modal-footer {
  display: flex;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid var(--color-border-light);
  background: var(--color-background-light);

  .cancel-btn,
  .save-btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.9rem;

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  .cancel-btn {
    background: var(--color-background);
    color: var(--color-text-secondary);
    border: 1px solid var(--color-border);

    &:hover:not(:disabled) {
      background: var(--color-background-hover);
      color: var(--color-text-primary);
    }
  }

  .save-btn {
    background: var(--color-primary);
    color: var(--color-white);
    flex: 1;

    &:hover:not(:disabled) {
      background: var(--color-primary-dark);
    }

    &.loading {
      background: var(--color-primary-light);
    }
  }
}

// Responsive design
@media (max-width: 768px) {
  .modal-overlay {
    padding: 0.5rem;
  }

  .modal-container {
    max-height: 95vh;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 1rem;
  }

  .modal-footer {
    flex-direction: column;

    .save-btn {
      order: -1;
    }
  }

  .form-group .form-textarea {
    min-height: 100px;
  }
}
</style>