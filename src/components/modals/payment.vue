<script setup lang="ts">
import { ref } from 'vue'
import paymentsService from '@/services/paymentsService'

interface PaymentForm {
  monto: number
  descripcion: string
  nombreCliente: string
  correoCliente: string
  telefono: string
  nombreNegocio: string
  prefijo: string
  direccion: string
  ci: string
}

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'success'): void
}>()

interface PaymentResponse {
  url: string;
  intentId: string;
}

const currentStep = ref(1)
const form = ref<PaymentForm>({
  monto: 0,
  descripcion: '',
  nombreCliente: '',
  correoCliente: '',
  telefono: '',
  nombreNegocio: '',
  prefijo: '593',
  direccion: '',
  ci: ''
})

const isLoading = ref(false)
const error = ref('')
const paymentResponse = ref<PaymentResponse | null>(null)
const copySuccess = ref(false)

const handleCopyUrl = async () => {
  if (paymentResponse.value?.url) {
    try {
      await navigator.clipboard.writeText(paymentResponse.value.url)
      copySuccess.value = true
      setTimeout(() => {
        copySuccess.value = false
      }, 2000)
    } catch (err) {
      console.error('Error al copiar:', err)
    }
  }
}

const handleSubmit = async () => {
  try {
    isLoading.value = true
    error.value = ''

    const response = await paymentsService.generatePagopluxPaymentLink(form.value)

    console.log('response: ', response)

    if (response.success && response.url && response.intentId) {
      paymentResponse.value = {
        url: response.url,
        intentId: response.intentId
      }
      currentStep.value = 4 // Cambiamos al paso de éxito
    } else {
      error.value = response.error || 'Error al generar el enlace de pago'
    }
  } catch (err: any) {
    error.value = err.message || 'Error al procesar la solicitud'
  } finally {
    isLoading.value = false
  }
}

const steps = [
  { number: 1, title: 'Detalles del Pago' },
  { number: 2, title: 'Información del Cliente' },
  { number: 3, title: 'Información del Negocio' },
  { number: 4, title: 'Enlace de Pago' }
]

const nextStep = () => {
  if (currentStep.value < steps.length) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

</script>

<template>
<div v-if="isOpen" class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Nueva Solicitud de Pago</h2>
        <button class="close-button" @click="emit('close')" aria-label="Cerrar modal">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="steps-indicator">
        <div 
          v-for="step in steps" 
          :key="step.number"
          :class="['step', {
            'step--active': currentStep === step.number,
            'step--completed': currentStep > step.number
          }]"
        >
          <div class="step-number">{{ step.number }}</div>
          <div class="step-title">{{ step.title }}</div>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="payment-form">
        <!-- Paso 1: Detalles del Pago -->
        <div v-if="currentStep === 1" class="step-content">
          <div class="form-group">
            <label for="monto">Monto (USD)</label>
            <input
              type="number"
              id="monto"
              v-model="form.monto"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div class="form-group">
            <label for="descripcion">Descripción</label>
            <textarea
              id="descripcion"
              v-model="form.descripcion"
              required
              rows="3"
            ></textarea>
          </div>
        </div>

        <!-- Paso 2: Información del Cliente -->
        <div v-if="currentStep === 2" class="step-content">
          <div class="form-row">
            <div class="form-group">
              <label for="nombreCliente">Nombre del Cliente</label>
              <input
                type="text"
                id="nombreCliente"
                v-model="form.nombreCliente"
                required
              />
            </div>

            <div class="form-group">
              <label for="correoCliente">Correo del Cliente</label>
              <input
                type="email"
                id="correoCliente"
                v-model="form.correoCliente"
                required
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="telefono">Teléfono</label>
              <input
                type="tel"
                id="telefono"
                v-model="form.telefono"
                required
              />
            </div>

            <div class="form-group">
              <label for="ci">Cédula/RUC</label>
              <input
                type="text"
                id="ci"
                v-model="form.ci"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label for="direccion">Dirección</label>
            <input
              type="text"
              id="direccion"
              v-model="form.direccion"
              required
            />
          </div>
        </div>

        <!-- Paso 3: Información del Negocio -->
        <div v-if="currentStep === 3" class="step-content">
          <div class="form-row">
            <div class="form-group">
              <label for="nombreNegocio">Nombre del Negocio</label>
              <input
                type="text"
                id="nombreNegocio"
                v-model="form.nombreNegocio"
                required
              />
            </div>

            <div class="form-group">
              <label for="prefijo">Prefijo</label>
              <input
                type="text"
                id="prefijo"
                v-model="form.prefijo"
                required
              />
            </div>
          </div>
        </div>

        <div v-if="currentStep === 4" class="step-content success-content">
        <div class="success-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <h3>¡Enlace generado exitosamente!</h3>

        <div class="url-container">
          <div class="url-box">
            <div class="url-text">{{ paymentResponse?.url }}</div>
            <button 
              class="copy-button" 
              :class="{ 'copy-success': copySuccess }" 
              @click="handleCopyUrl"
            >
              <i class="fas fa-copy"></i>
              <span v-if="!copySuccess">Copiar</span>
              <span v-else>¡Copiado!</span>
            </button>
          </div>
          <div class="url-info">Comparte este enlace con el cliente para que realice el pago.</div>
        </div>

        <div class="success-actions">
          <a 
            :href="paymentResponse?.url" 
            target="_blank" 
            class="visit-button"
          >
            <i class="fas fa-external-link-alt"></i>
            Ver Enlace
          </a>
          <button 
            class="new-payment-button" 
            @click="() => { currentStep = 1; paymentResponse = null; form.monto = 0 }"
          >
            <i class="fas fa-plus-circle"></i>
            Nuevo Pago
          </button>
        </div>
      </div>

        <p v-if="error" class="error-message">{{ error }}</p>

        <div class="form-actions">
          <button 
            type="button" 
            class="cancel-button"
            @click="prevStep"
            v-if="currentStep > 1"
          >
            <i class="fas fa-arrow-left"></i>
            Anterior
          </button>

          <button 
            type="button" 
            class="next-button"
            @click="nextStep"
            v-if="currentStep < steps.length"
          >
            Siguiente
            <i class="fas fa-arrow-right"></i>
          </button>

          <button 
            type="submit" 
            class="submit-button"
            :disabled="isLoading"
            v-if="currentStep === steps.length && !paymentResponse"
          >
            <i v-if="isLoading" class="fas fa-spinner fa-spin"></i>
            <span v-else>Generar Enlace de Pago</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/index.scss' as *;

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba($BAKANO-DARK, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: $white;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba($BAKANO-DARK, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;

  h2 {
    margin: 0;
    color: $BAKANO-DARK;
    font-size: 1.5rem;
    font-weight: 600;
  }
}

.close-button {
  background: none;
  border: none;
  color: rgba($BAKANO-DARK, 0.5);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  transition: all 0.3s ease;

  &:hover {
    color: $BAKANO-DARK;
  }
}

.payment-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
  width: 100%;

  label {
    display: block;
    margin-bottom: 0.5rem;
    color: $BAKANO-DARK;
    font-weight: 500;
  }

  input,
  textarea {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid rgba($BAKANO-DARK, 0.1);
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.3s ease;

    &:focus {
      outline: none;
      border-color: $BAKANO-PINK;
      box-shadow: 0 0 0 3px rgba($BAKANO-PINK, 0.1);
    }
  }

  textarea {
    resize: vertical;
  }
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.error-message {
  color: #ff4444;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  text-align: center;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.submit-button,
.cancel-button {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.submit-button {
  background: $BAKANO-PINK;
  color: $white;
  border: none;

  &:hover {
    background: darken($BAKANO-PINK, 5%);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
}

.cancel-button {
  background: none;
  border: 2px solid rgba($BAKANO-DARK, 0.1);
  color: $BAKANO-DARK;

  &:hover {
    background: rgba($BAKANO-DARK, 0.05);
  }
}

.steps-indicator {
  display: flex;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid rgba($BAKANO-DARK, 0.1);
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  position: relative;

  &:not(:last-child)::after {
    content: '';
    position: absolute;
    top: 20px;
    right: -50%;
    width: 100%;
    height: 2px;
    background: rgba($BAKANO-DARK, 0.1);
    z-index: 1;
  }

  &--active {
    .step-number {
      background: $BAKANO-PINK;
      color: $white;
    }

    .step-title {
      color: $BAKANO-PINK;
    }
  }

  &--completed {
    .step-number {
      background: darken($BAKANO-PINK, 10%);
      color: $white;

      &::after {
        content: '✓';
      }
    }

    &::after {
      background: $BAKANO-PINK;
    }
  }
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba($BAKANO-DARK, 0.1);
  color: $BAKANO-DARK;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-bottom: 0.5rem;
  position: relative;
  z-index: 2;
}

.step-title {
  font-size: 0.9rem;
  color: $BAKANO-DARK;
  text-align: center;
}

.step-content {
  animation: fadeIn 0.3s ease;
}

.next-button {
  @extend .submit-button;
  background: $BAKANO-DARK;

  &:hover {
    background: darken($BAKANO-DARK, 5%);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .step-title {
    font-size: 0.8rem;
  }

  .steps-indicator {
    padding: 1rem;
  }

  .step-number {
    width: 32px;
    height: 32px;
    font-size: 0.9rem;
  }
}

.success-content {
  text-align: center;
  padding: 2rem 1rem;

  .success-icon {
    font-size: 4rem;
    color: #4CAF50;
    margin-bottom: 1rem;
    animation: scaleIn 0.5s ease;
  }

  h3 {
    color: $BAKANO-DARK;
    margin-bottom: 2rem;
    font-size: 1.5rem;
  }
}

.url-container {
  margin: 2rem 0;
}

.url-box {
  background: rgba($BAKANO-DARK, 0.05);
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;

  .url-text {
    flex: 1;
    word-break: break-all;
    font-family: monospace;
    color: $BAKANO-DARK;
  }
}

.url-info {
  font-size: 0.9rem;
  color: rgba($BAKANO-DARK, 0.7);
  margin-top: 0.5rem;
}

.copy-button {
  background: $white;
  border: 2px solid rgba($BAKANO-DARK, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;

  &:hover {
    background: rgba($BAKANO-DARK, 0.05);
  }

  &.copy-success {
    background: #4CAF50;
    color: $white;
    border-color: #4CAF50;
  }
}

.success-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;

  .visit-button,
  .new-payment-button {
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }

  .visit-button {
    background: $BAKANO-PINK;
    color: $white;
    text-decoration: none;

    &:hover {
      background: darken($BAKANO-PINK, 5%);
      transform: translateY(-1px);
    }
  }

  .new-payment-button {
    background: $white;
    border: 2px solid rgba($BAKANO-DARK, 0.1);
    color: $BAKANO-DARK;

    &:hover {
      background: rgba($BAKANO-DARK, 0.05);
    }
  }
}

@keyframes scaleIn {
  from {
    transform: scale(0);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>