<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePaymentsStore } from '@/stores/payments'
import GeneratePaymentLink from '@/components/Wizards/generatePaymentLink/index.vue'
import ManualTransferWizard from '@/components/Wizards/registerTransfer/index.vue'

const welcomeMessage = ref('Panel de Solicitudes de Pago')
const isPaymentModalOpen = ref(false)
const isTransferModalOpen = ref(false)
const paymentsStore = usePaymentsStore()
const isLoading = ref(true)

const formatDateToLocalYYYYMMDD = (date: Date) => {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}

const refreshSummary = async () => {
  isLoading.value = true
  const today = new Date()
  const from = new Date(today.getFullYear(), today.getMonth(), 1)
  const to = new Date(today)
  to.setDate(to.getDate() + 1) // incluir el día completo
  await paymentsStore.fetchSummary(formatDateToLocalYYYYMMDD(from), formatDateToLocalYYYYMMDD(to))
  isLoading.value = false
}

onMounted(() => {
  refreshSummary()
})

const handlePaymentSuccess = () => {
  console.log('Pago generado exitosamente')
  refreshSummary()
}

const paidByLink = computed(() => paymentsStore.summary?.confirmedPayments.withIntent.count || 0)
const paidByTransfer = computed(() => paymentsStore.summary?.confirmedPayments.directTransfer.count || 0)
const totalPaid = computed(() => paidByLink.value + paidByTransfer.value)
</script>

<template>
  <main class="dashboard">
    <div class="dashboard-content">
      <h1 class="dashboard-title">{{ welcomeMessage }}</h1>

      <div v-if="isLoading" class="loading-message">
        <i class="fas fa-spinner fa-spin"></i> Cargando resumen del mes actual...
      </div>

      <div v-else class="dashboard-stats">
        <div class="stat-card">
          <i class="fas fa-link"></i>
          <h3>Links de Pago Generados</h3>
          <p class="stat-number">{{ paymentsStore.summary?.intents.totalCount || 0 }}</p>
        </div>
        <div class="stat-card">
          <i class="fas fa-check-circle"></i>
          <h3>Pagos Completados</h3>
          <p class="stat-number">{{ totalPaid }}</p>
        </div>
        <div class="stat-card">
          <i class="fas fa-bolt"></i>
          <h3>Pagos por Link</h3>
          <p class="stat-number">{{ paidByLink }}</p>
        </div>
        <div class="stat-card">
          <i class="fas fa-university"></i>
          <h3>Pagos por Transferencia</h3>
          <p class="stat-number">{{ paidByTransfer }}</p>
        </div>
        <div class="stat-card">
          <i class="fas fa-clock"></i>
          <h3>Pagos Pendientes</h3>
          <p class="stat-number">{{ paymentsStore.summary?.intents.pending.count || 0 }}</p>
        </div>
      </div>

      <div class="actions-container">
        <button class="action-button" @click="isPaymentModalOpen = true">
          <i class="fas fa-plus"></i> Nueva Solicitud de Pago
        </button>
        <button class="action-button" @click="isTransferModalOpen = true">
          <i class="fas fa-money-check-alt"></i> Registrar Pago Manual
        </button>
      </div>
    </div>
  </main>

  <GeneratePaymentLink
    :is-open="isPaymentModalOpen"
    @close="isPaymentModalOpen = false"
    @success="handlePaymentSuccess"
  />

  <ManualTransferWizard
    :is-open="isTransferModalOpen"
    @close="isTransferModalOpen = false"
    @success="handlePaymentSuccess"
  />
</template>

<style lang="scss" scoped>
@use '@/styles/index.scss' as *;

.dashboard {
  padding: 2rem;
  min-height: calc(100vh - 64px);
  background-color: $white;

  &-content {
    max-width: 1200px;
    margin: 0 auto;
  }

  &-title {
    font-size: 2rem;
    color: $BAKANO-DARK;
    margin-bottom: 2rem;
    font-weight: 700;
  }

  &-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
}

.loading-message {
  text-align: center;
  font-size: 1.1rem;
  color: rgba($BAKANO-DARK, 0.7);
  margin: 2rem 0;

  i {
    margin-right: 0.5rem;
    color: $BAKANO-PINK;
  }
}

.stat-card {
  background: $white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba($BAKANO-PINK, 0.1);
  text-align: center;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }

  i {
    font-size: 2rem;
    color: $BAKANO-PINK;
    margin-bottom: 1rem;
  }

  h3 {
    color: $BAKANO-DARK;
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
  }

  .stat-number {
    font-size: 2rem;
    font-weight: 700;
    color: $BAKANO-PINK;
  }
}

.actions-container {
  margin-top: 2rem;
  text-align: center;
  display: flex;
  justify-content: center;
  gap: 1.5rem;
}

.action-button {
  background: $BAKANO-PINK;
  color: $white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: darken($BAKANO-PINK, 5%);
    transform: translateY(-2px);
  }

  i {
    font-size: 1.2rem;
  }
}

@media (max-width: 768px) {
  .dashboard {
    padding: 1rem;
  }
}
</style>
