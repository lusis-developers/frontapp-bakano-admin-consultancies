<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePaymentsStore } from '@/stores/payments'
import PaymentsDashboard from './Dashboard/payment.vue'
import ClientsDashboard from './Dashboard/clients.vue'
import PaymentChart from '@/components/charts/paymentChart.vue'

const currentTab = ref<'payments' | 'clients'>('payments')
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
  to.setDate(to.getDate() + 1)
  await paymentsStore.fetchSummary(formatDateToLocalYYYYMMDD(from), formatDateToLocalYYYYMMDD(to))
  isLoading.value = false
}

onMounted(() => {
  refreshSummary()
})

const paidByLink = computed(() => paymentsStore.summary?.confirmedPayments.withIntent.count || 0)
const paidByTransfer = computed(() => paymentsStore.summary?.confirmedPayments.directTransfer.count || 0)
const pending = computed(() => paymentsStore.summary?.intents.pending.count || 0)
</script>

<template>
  <div class="dashboard-wrapper">
    <nav class="dashboard-menu">
      <button
        :class="{ active: currentTab === 'payments' }"
        @click="currentTab = 'payments'"
      >
        <i class="fas fa-file-invoice-dollar"></i> Pagos
      </button>
      <button
        :class="{ active: currentTab === 'clients' }"
        @click="currentTab = 'clients'"
      >
        <i class="fas fa-users"></i> Clientes
      </button>
    </nav>

    <div class="dashboard-view">
      <PaymentsDashboard v-if="currentTab === 'payments'" />
      <ClientsDashboard v-else />
    </div>

    <!-- GRÁFICO -->
    <div class="dashboard-chart-wrapper" v-if="currentTab === 'payments' && !isLoading">
      <div class="chart-card">
        <h3 class="chart-title">Distribución de Pagos</h3>
        <PaymentChart
          :paid-by-link="paidByLink"
          :paid-by-transfer="paidByTransfer"
          :pending="pending"
        />
      </div>
    </div>
  </div>
</template>


<style scoped lang="scss">
@use '@/styles/index.scss' as *;

.dashboard-wrapper {
  padding: 48px 16px;
}

.dashboard-menu {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;

  button {
    background: none;
    border: 2px solid $BAKANO-PINK;
    color: $BAKANO-PINK;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &.active {
      background: $BAKANO-PINK;
      color: $white;
    }

    &:hover:not(.active) {
      background: rgba($BAKANO-PINK, 0.1);
    }
  }
}

.dashboard-view {
  padding: 0 1rem;
}

.dashboard-chart {
  margin-top: 3rem;
  display: flex;
  justify-content: center;
}


.dashboard-chart-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 3rem;
  padding: 0 1rem;
}

.chart-card {
  background: $white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  padding: 2rem;
  max-width: 480px;
  width: 100%;
  text-align: center;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-4px);
  }

  .chart-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: $BAKANO-DARK;
    margin-bottom: 1.5rem;
  }
}
</style>
