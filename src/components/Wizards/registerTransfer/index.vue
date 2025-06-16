<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Step0 from './steps/step0.vue'
import Step1 from './steps/step1.vue'
import Step2 from './steps/step2.vue'
import Step3 from './steps/step3.vue'
import Step4 from './steps/step4.vue'
import paymentService from '@/services/paymentsService'
// AHORA: Importamos el enum y la interfaz corregida
import ConfirmCloseModal from '@/components/modals/confirmCloseModal.vue'
import type { ManualPaymentForm } from '@/types/manualTransfer.interface'
import { PayMethod } from '@/enums/payMethod.enum'

const props = defineProps<{ isOpen: boolean }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'success'): void }>()

const currentStep = ref(0)
// AHORA: El formulario usa la interfaz renombrada
const form = ref<ManualPaymentForm>({
  amount: 0,
  description: '',
  clientName: '',
  email: '',
  phone: '',
  businessName: '',
  bank: '',
  clientId: '',
  country: 'ecuador',
  paymentMethod: null,
})

const isLoading = ref(false)
const error = ref('')
const success = ref(false)
const stepValid = ref(false)
const wasConfirmed = ref(false)
const showConfirmClose = ref(false)

const steps = [0, 1, 2, 3, 4]

// CORRECCIÓN: Se invalida el paso antes de avanzar para evitar doble-clic
const nextStep = () => {
  if (stepValid.value && currentStep.value < steps.length - 1) {
    stepValid.value = false; // Invalida temporalmente hasta que el nuevo paso se valide
    currentStep.value++
  }
}
const prevStep = () => { if (currentStep.value > 0) currentStep.value-- }

const wizardTitle = computed(() => {
  if (currentStep.value === 0) return 'Registrar Pago Manual'
  // AHORA: Comparamos con los valores del enum
  if (form.value.paymentMethod === PayMethod.DATIL) return 'Registro por Dátil'
  if (form.value.paymentMethod === PayMethod.BANK_TRANSFER) return 'Registro por Transferencia'
  return 'Registrar Pago'
})

// AHORA: El handler recibe el tipo del enum
const handleMethodSelect = (method: PayMethod) => {
  form.value.paymentMethod = method
  stepValid.value = true // Este paso es válido una vez se selecciona
  nextStep()
}

const handleSubmit = async () => {
  isLoading.value = true
  error.value = ''
  try {
    // SUGERENCIA: Renombrar este servicio a 'registerManualPayment' sería ideal
    await paymentService.registerManualTransfer(form.value)
    success.value = true
    wasConfirmed.value = true
    currentStep.value = 4
    emit('success')
  } catch (err: any) {
    error.value = err.message || 'Error al registrar el pago'
  } finally {
    isLoading.value = false
  }
}

const tryToClose = () => {
  if (currentStep.value > 0 && isDirty.value) {
    showConfirmClose.value = true
  } else {
    emit('close')
  }
}
const confirmClose = () => {
  showConfirmClose.value = false
  emit('close')
}
const cancelClose = () => {
  showConfirmClose.value = false
}

const isDirty = computed(() => {
  return Object.entries(form.value).some(([key, value]) => {
    if (key === 'paymentMethod' || key === 'country') return false
    return value !== '' && value !== 0
  })
})

watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    currentStep.value = 0
    stepValid.value = false
    success.value = false
    wasConfirmed.value = false
    error.value = ''
    isLoading.value = false
    form.value = {
      amount: 0,
      description: '',
      clientName: '',
      email: '',
      phone: '',
      businessName: '',
      bank: '',
      clientId: '',
      country: 'ecuador',
      paymentMethod: null,
    }
  }
})
</script>

<template>
  <div v-if="props.isOpen" class="modal-overlay" @click.self="tryToClose">
    <div class="modal-content">
      <div class="modal-header">
        <h2>{{ wizardTitle }}</h2>
        <button class="close-button" @click="tryToClose"><i class="fas fa-times"></i></button>
      </div>

      <div v-if="currentStep > 0" class="steps-indicator">
        <div
          v-for="step in steps.slice(1)" :key="step"
          :class="['step', { 'step--active': currentStep === step, 'step--completed': currentStep > step }]"
        >
          <div class="step-number">{{ step }}</div>
        </div>
      </div>

      <form class="wizard-form">
        <Step0 v-if="currentStep === 0" @select="(method: 'datil' | 'transferencia') => handleMethodSelect(method as PayMethod)" />

        <Step1 v-if="currentStep === 1" :form="form" @valid="stepValid = $event" />
        <Step2 v-if="currentStep === 2" :form="form" @valid="stepValid = $event" />
        <Step3 v-if="currentStep === 3" :form="form" @valid="stepValid = $event" />
        <Step4
          v-if="currentStep === 4"
          :form="form"
          :is-loading="isLoading"
          :was-confirmed="wasConfirmed"
          @confirm="handleSubmit"
          @edit="() => { currentStep = 1 }"
          @close="tryToClose"
        />

        <p v-if="error" class="error-message">{{ error }}</p>

        <div class="form-actions" v-if="currentStep > 0 && currentStep < 4">
          <button type="button" class="cancel-button" @click="prevStep">Anterior</button>
          <button
            type="button"
            class="next-button"
            @click="nextStep"
            :disabled="!stepValid"
            v-if="currentStep < 3"
          >
            Siguiente
          </button>
          <button
            type="button"
            class="next-button"
            @click="nextStep"
            :disabled="!stepValid"
            v-if="currentStep === 3"
          >
            Ver Resumen
          </button>
        </div>
      </form>
    </div>
  </div>
  <ConfirmCloseModal :open="showConfirmClose" @confirm="confirmClose" @cancel="cancelClose" />
</template>

<style scoped lang="scss">
@use '@/styles/index.scss' as *;

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba($BAKANO-DARK, 0.6);
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
      font-size: 0.95rem;
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

.wizard-form {
  padding: 1.5rem;

  input,
  select,
  textarea {
    width: 100%;
    padding: 0.75rem 1rem;
    margin-top: 0.25rem;
    margin-bottom: 1rem;
    border: 1px solid rgba($BAKANO-DARK, 0.1);
    border-radius: 8px;
    font-size: 0.95rem;
    font-family: $font-principal;
    background-color: $BAKANO-LIGHT;

    &:focus {
      outline: none;
      border-color: $BAKANO-PINK;
      background-color: #fff;
    }
  }

  label {
    font-weight: 500;
    font-size: 0.9rem;
    color: $BAKANO-DARK;
  }
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
