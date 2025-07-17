<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePaymentsStore } from '@/stores/payments'
import GeneratePaymentLink from '@/components/Wizards/generatePaymentLink/index.vue'
import ManualTransferWizard from '@/components/Wizards/registerTransfer/index.vue'
import InfoModal from '@/components/globals/InfoModal.vue'

const paymentsStore = usePaymentsStore()

const welcomeMessage = ref('Panel de Solicitudes de Pago')
const isPaymentModalOpen = ref(false)
const isTransferModalOpen = ref(false)
const isComingSoonModalOpen = ref(false)
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
  to.setDate(to.getDate() + 1)
  // Simulamos una pequeña demora para apreciar el estado de carga
  await new Promise(resolve => setTimeout(resolve, 500));
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
  <main class="dashboard-payment">
    <header class="dashboard-header">
      <h1 class="dashboard-title">{{ welcomeMessage }}</h1>
      <p class="dashboard-subtitle">Resumen de la actividad de pagos del mes actual.</p>
    </header>

    <div v-if="isLoading" class="loading-container">
      <div class="spinner"></div>
      <p>Cargando resumen...</p>
    </div>

    <div v-else class="dashboard-content">
      <section class="stats-grid">
        <div class="stat-card">
          <div class="icon-wrapper links"><i class="fas fa-link"></i></div>
          <p class="stat-number">{{ paymentsStore.summary?.intents.totalCount || 0 }}</p>
          <h3 class="stat-title">Links Generados</h3>
        </div>
        <div class="stat-card">
          <div class="icon-wrapper completed"><i class="fas fa-check-circle"></i></div>
          <p class="stat-number">{{ totalPaid }}</p>
          <h3 class="stat-title">Pagos Completados</h3>
        </div>
        <div class="stat-card">
          <div class="icon-wrapper by-link"><i class="fas fa-bolt"></i></div>
          <p class="stat-number">{{ paidByLink }}</p>
          <h3 class="stat-title">Pagos por Link</h3>
        </div>
        <div class="stat-card">
          <div class="icon-wrapper transfer"><i class="fas fa-university"></i></div>
          <p class="stat-number">{{ paidByTransfer }}</p>
          <h3 class="stat-title">Por Transferencia</h3>
        </div>
        <div class="stat-card">
          <div class="icon-wrapper pending"><i class="fas fa-clock"></i></div>
          <p class="stat-number">{{ paymentsStore.summary?.intents.pending.count || 0 }}</p>
          <h3 class="stat-title">Pagos Pendientes</h3>
        </div>
      </section>

      <section class="actions-container">
        <button class="action-button primary" @click="isComingSoonModalOpen = true">
          <i class="fas fa-plus"></i> Nueva Solicitud de Pago
        </button>
        <button class="action-button secondary" @click="isTransferModalOpen = true">
          <i class="fas fa-money-check-alt"></i> Registrar Pago Manual
        </button>
      </section>
    </div>
  </main>

  <GeneratePaymentLink :is-open="isPaymentModalOpen" @close="isPaymentModalOpen = false" @success="handlePaymentSuccess" />
  <ManualTransferWizard :is-open="isTransferModalOpen" @close="isTransferModalOpen = false" @success="handlePaymentSuccess" />
  <InfoModal :is-open="isComingSoonModalOpen" @close="isComingSoonModalOpen = false">
    <i class="fas fa-cogs info-modal-icon"></i>
    <h2 class="info-modal-title">¡Función en Camino!</h2>
    <p class="info-modal-text">
      Estamos mejorando nuestra plataforma para ti. Muy pronto, desde aquí podrás generar solicitudes de pago automáticas y registrarlas directamente bajo el servicio de <strong>Dátil</strong>.
    </p>
  </InfoModal>
</template>

<style lang="scss" scoped>
@use '@/styles/index.scss' as *;

.dashboard-payment {
  padding: 2rem;
  background-color: lighten($white, 3.5%);
}

.dashboard-header {
  max-width: 1200px;
  margin: 0 auto 2.5rem auto;
  text-align: center;

  .dashboard-title {
    font-family: $font-principal;
    font-size: 2.25rem;
    color: $BAKANO-DARK;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
  }

  .dashboard-subtitle {
    font-family: $font-secondary;
    font-size: 1.1rem;
    color: rgba($BAKANO-DARK, 0.7);
    margin: 0;
  }
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1rem;
  gap: 1rem;
  font-family: $font-secondary;
  color: rgba($BAKANO-DARK, 0.7);

  .spinner {
    width: 86px;
    height: 86px;
    border: 5px solid $overlay-purple;
    border-top-color: $BAKANO-PURPLE;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.dashboard-content {
  max-width: 1200px;
  margin: 0 auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: $white;
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid $BAKANO-LIGHT;
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px) scale(1.03);
    box-shadow: 0 10px 30px rgba($BAKANO-DARK, 0.08);
  }

  .icon-wrapper {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    margin: 0 auto 1.5rem auto;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.75rem;

    &.links {
      background-color: $overlay-purple;
      color: $BAKANO-PURPLE;
    }

    &.completed {
      background-color: lighten($BAKANO-GREEN, 35%);
      color: $BAKANO-GREEN;
    }

    &.by-link {
      background-color: lighten(orange, 35%);
      color: orange;
    }

    &.transfer {
      background-color: lighten(royalblue, 35%);
      color: royalblue;
    }

    &.pending {
      background-color: lighten($BAKANO-PINK, 40%);
      color: $BAKANO-PINK;
    }
  }

  .stat-number {
    font-family: $font-principal;
    font-size: 2.5rem;
    font-weight: 700;
    color: $BAKANO-DARK;
    margin: 0 0 0.25rem 0;
  }

  .stat-title {
    font-family: $font-secondary;
    color: rgba($BAKANO-DARK, 0.6);
    font-size: 1rem;
    font-weight: 500;
    margin: 0;
  }
}

.actions-container {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid $BAKANO-LIGHT;
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.action-button {
  font-family: $font-principal;
  font-size: 1.1rem;
  font-weight: 600;
  border: 2px solid $BAKANO-PINK;
  padding: 0.9rem 2rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;

  &.primary {
    background: $BAKANO-PINK;
    color: $white;

    &:hover {
      background: darken($BAKANO-PINK, 8%);
      transform: translateY(-2px);
    }
  }

  &.secondary {
    background: transparent;
    color: $BAKANO-PINK;

    &:hover {
      background: $BAKANO-PINK;
      color: $white;
    }
  }

  i {
    font-size: 1.2rem;
  }
}

:deep(.info-modal-icon) {
  font-size: 3rem;
  color: $BAKANO-PINK;
  margin-bottom: 1.5rem;
}

:deep(.info-modal-title) {
  font-size: 1.5rem;
  font-weight: 600;
  color: $BAKANO-DARK;
  margin-bottom: 1rem;
}

:deep(.info-modal-text) {
  font-size: 1rem;
  color: rgba($BAKANO-DARK, 0.8);
  line-height: 1.6;
}

@media (max-width: 768px) {
  .dashboard-payment {
    padding: 1rem;
  }

  .dashboard-header {
    margin-bottom: 2rem;
  }

  .stats-grid {
    gap: 1rem;
  }
}
</style>