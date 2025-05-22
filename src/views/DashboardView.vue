<script setup lang="ts">
import { ref } from 'vue'
import PaymentsDashboard from './Dashboard/payment.vue'
import ClientsDashboard from './Dashboard/clients.vue'

const currentTab = ref<'payments' | 'clients'>('payments')
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
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/index.scss' as *;

.dashboard-wrapper {
  padding: 1rem;
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
</style>
