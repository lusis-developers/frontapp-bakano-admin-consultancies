<script setup lang="ts">
import { ref } from 'vue'
import PaymentModal from '@/components/modals/payment.vue'

const welcomeMessage = ref('Panel de Solicitudes de Pago')
const isPaymentModalOpen = ref(false)

const handlePaymentSuccess = () => {
  // Aquí podrías actualizar las estadísticas o mostrar un mensaje de éxito
  console.log('Pago generado exitosamente')
}
</script>

<template>
  <main class="dashboard">
    <div class="dashboard-content">
      <h1 class="dashboard-title">{{ welcomeMessage }}</h1>
      <div class="dashboard-stats">
        <div class="stat-card">
          <i class="fas fa-money-bill-wave"></i>
          <h3>Pagos Generados</h3>
          <p class="stat-number">0</p>
        </div>
        <div class="stat-card">
          <i class="fas fa-check-circle"></i>
          <h3>Pagos Completados</h3>
          <p class="stat-number">0</p>
        </div>
        <div class="stat-card">
          <i class="fas fa-clock"></i>
          <h3>Pagos Pendientes</h3>
          <p class="stat-number">0</p>
        </div>
      </div>

      <div class="actions-container">
        <button class="action-button" @click="isPaymentModalOpen = true">
          <i class="fas fa-plus"></i>
          Nueva Solicitud de Pago
        </button>
      </div>
    </div>
  </main>

  <PaymentModal 
    :is-open="isPaymentModalOpen"
    @close="isPaymentModalOpen = false"
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