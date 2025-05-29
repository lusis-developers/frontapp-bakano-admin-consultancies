<script setup lang="ts">
import { ref, watch } from 'vue'
import Step1 from './steps/step1.vue'
import Step2 from './steps/step2.vue'
import Step3 from './steps/step3.vue'
import Step4 from './steps/step4.vue'
import paymentsService from '@/services/paymentsService'
import ConfirmCloseModal from '@/components/modals/confirmCloseModal.vue'

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
  mongoId?: string
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
const showCloseConfirm = ref(false)

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


const tryClose = () => {
  showCloseConfirm.value = true
}

const confirmClose = () => {
  showCloseConfirm.value = false
  emit('close')
}

const cancelClose = () => {
  showCloseConfirm.value = false
}

const resetForm = () => {
  form.value = {
    monto: 0,
    descripcion: '',
    nombreCliente: '',
    correoCliente: '',
    telefono: '',
    nombreNegocio: '',
    prefijo: '593',
    direccion: '',
    ci: '',
    mongoId: undefined,
  }
  paymentResponse.value = null
  currentStep.value = 1
  error.value = ''
  isLoading.value = false
  copySuccess.value = false
}

// Agregar watch para props.isOpen
watch(() => props.isOpen, (newValue) => {
  if (!newValue) {
    resetForm()
  }
})

const handleSubmit = async () => {
  try {
    console.log('Submitting form with data:', form.value)
    isLoading.value = true
    error.value = ''
    const response = await paymentsService.generatePagopluxPaymentLink(form.value)
    console.log('Payment response:', response)
    if (response.success && response.url && response.intentId) {
      paymentResponse.value = {
        url: response.url,
        intentId: response.intentId
      }
      currentStep.value = 4
      console.log('Success! Payment response:', paymentResponse.value)
      emit('success')
    } else {
      error.value = response.error || 'Error al generar el enlace de pago'
    }
  } catch (err: any) {
    console.error('Error in handleSubmit:', err)
    error.value = err.message || 'Error al procesar la solicitud'
  } finally {
    isLoading.value = false
  }
}

const steps = [1, 2, 3, 4]
const nextStep = () => { if (currentStep.value < steps.length) currentStep.value++ }
const prevStep = () => { if (currentStep.value > 1) currentStep.value-- }
</script>

<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="tryClose">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Nueva Solicitud de Pago</h2>
        <button class="close-button" @click="tryClose" aria-label="Cerrar modal">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="steps-indicator">
        <div v-for="step in steps" :key="step" :class="['step', { 'step--active': currentStep === step, 'step--completed': currentStep > step }]"><div class="step-number">{{ step }}</div></div>
      </div>

      <form @submit.prevent="handleSubmit" class="payment-form">
        <Step1 v-if="currentStep === 1" :form="form" />
        <Step2 v-if="currentStep === 2" :form="form" />
        <Step3 v-if="currentStep === 3" :form="form" />
        <Step4
          v-if="currentStep === 4 && paymentResponse"
          :payment-response="paymentResponse"
          :copy-success="copySuccess"
          @copy="handleCopyUrl"
          @new="resetForm"
        />

        <p v-if="error" class="error-message">{{ error }}</p>

        <div class="form-actions" v-if="currentStep < 4">
          <button type="button" class="cancel-button" @click="prevStep" v-if="currentStep > 1">
            <i class="fas fa-arrow-left"></i> Anterior
          </button>
          <button type="button" class="next-button" @click="nextStep" v-if="currentStep < 3">
            Siguiente <i class="fas fa-arrow-right"></i>
          </button>
          <button type="submit" class="submit-button" :disabled="isLoading" v-if="currentStep === 3 && !paymentResponse">
            <i v-if="isLoading" class="fas fa-spinner fa-spin"></i>
            <span v-else>Generar Enlace de Pago</span>
          </button>
        </div>
      </form>
    </div>
  </div>
  <ConfirmCloseModal
    :open="showCloseConfirm"
    @confirm="confirmClose"
    @cancel="cancelClose" />
</template>

<style lang="scss" scoped>
@use '@/styles/index.scss' as *;

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba($BAKANO-DARK, 0.6); // Oscurece el fondo
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
  overflow-y: auto;
}

.modal-content {
  background: $white;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  animation: fadeInUp 0.3s ease;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba($BAKANO-DARK, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;

  h2 {
    margin: 0;
    font-size: 1.5rem;
    color: $BAKANO-DARK;
    font-weight: 600;
  }
}

.close-button {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: rgba($BAKANO-DARK, 0.6);
  cursor: pointer;

  &:hover {
    color: $BAKANO-DARK;
  }
}

.steps-indicator {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 1rem 0;

  .step {
    display: flex;
    flex-direction: column;
    align-items: center;

    .step-number {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba($BAKANO-DARK, 0.1);
      color: $BAKANO-DARK;
      display: flex;
      justify-content: center;
      align-items: center;
      font-weight: bold;
      margin-bottom: 0.25rem;
    }

    &--active .step-number {
      background: $BAKANO-PINK;
      color: $white;
    }

    &--completed .step-number {
      background: darken($BAKANO-PINK, 10%);
      color: $white;
    }
  }
}

.payment-form {
  padding: 1.5rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.submit-button,
.cancel-button,
.next-button {
  background: $BAKANO-PINK;
  color: $white;
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;

  &:hover {
    background: darken($BAKANO-PINK, 5%);
  }

  &:disabled {
    background: rgba($BAKANO-PINK, 0.5);
    cursor: not-allowed;
  }
}

.cancel-button {
  background: none;
  color: $BAKANO-DARK;
  border: 2px solid rgba($BAKANO-DARK, 0.2);

  &:hover {
    background: rgba($BAKANO-DARK, 0.05);
  }
}

.error-message {
  text-align: center;
  color: red;
  font-weight: 500;
  margin-top: 1rem;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
