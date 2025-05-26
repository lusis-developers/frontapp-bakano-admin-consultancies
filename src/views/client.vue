<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { format } from 'date-fns'
import useClientAndBusinessStore from '@/stores/clientAndBusiness'

const route = useRoute()
const router = useRouter()
const clientId = route.params.clientId as string

const store = useClientAndBusinessStore()

onMounted(async () => {
  await store.fetchClientWithDetails(clientId)
})

const formatDate = (date?: string) =>
  date ? format(new Date(date), 'dd MMM yyyy HH:mm') : 'No disponible'


const goToAllBusinesses = () => {
  router.push({ name: 'businesses', params: { clientId } })
}
</script>

<template>
  <div class="client-view">
    <h1 class="page-title">Detalles del Cliente</h1>

    <div v-if="store.isLoading" class="loading">
      <i class="fas fa-spinner fa-spin"></i> Cargando datos del cliente...
    </div>

    <div v-else-if="store.error" class="error">
      <p>Error: {{ store.error.message }}</p>
    </div>

    <div v-else-if="store.client" class="client-details">
      <section class="card">
        <h2>{{ store.client.name }}</h2>
        <p><strong>Correo:</strong> {{ store.client.email }}</p>
        <p><strong>Teléfono:</strong> {{ store.client.phone }}</p>
        <p><strong>Ubicación:</strong> {{ store.client.city }}, {{ store.client.country }}</p>
        <p><strong>Último Pago:</strong> {{ formatDate(store.client.paymentInfo?.lastPaymentDate) }}</p>
        <p><strong>Método de Pago:</strong> {{ store.client.paymentInfo?.preferredMethod }}</p>
        <p><strong>Banco:</strong> {{ store.client.paymentInfo?.bank }}</p>
      </section>

      <section v-if="store.businesses?.length" class="card">
        <h3>Último Negocio Registrado</h3>
        <div class="business-summary">
          <h4>{{ store.businesses.at(-1)?.name }}</h4>
          <p><strong>RUC:</strong> {{ store.businesses.at(-1)?.ruc }}</p>
          <p><strong>Teléfono:</strong> {{ store.businesses.at(-1)?.phone }}</p>
          <p><strong>Dirección:</strong> {{ store.businesses.at(-1)?.address }}</p>
          <p><strong>Categoría:</strong> {{ store.businesses.at(-1)?.category || 'No especificada' }}</p>
          <button @click="goToAllBusinesses" class="view-all-button">Ver todos los negocios</button>
        </div>
      </section>

      <section v-if="store.client.transactions?.length" class="card">
        <h3>Transacciones</h3>
        <ul>
          <li v-for="tx in store.client.transactions" :key="tx._id || tx">
            ID: {{ tx.transactionId || tx }} | Monto: ${{ tx.amount }} | {{ formatDate(tx.date) }}
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/index.scss' as *;

.client-view {
  padding: 2rem;
  max-width: 960px;
  margin: 0 auto;
}

.page-title {
  font-size: 2rem;
  margin-bottom: 1.5rem;
  color: $BAKANO-DARK;
}

.loading,
.error {
  text-align: center;
  font-size: 1rem;
  color: $BAKANO-PINK;
}

.card {
  background: $white;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba($BAKANO-PINK, 0.08);

  h2,
  h3 {
    margin-bottom: 1rem;
    color: $BAKANO-PURPLE;
  }

  p,
  li {
    margin: 0.3rem 0;
    color: $BAKANO-DARK;
  }

  ul {
    list-style: disc;
    padding-left: 1.5rem;
  }
}

.business-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.2rem;
}

.business-card {
  background: $BAKANO-LIGHT;
  border: 2px solid $BAKANO-PURPLE;
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba($BAKANO-PURPLE, 0.2);
  }

  h4 {
    margin-bottom: 0.5rem;
    color: $BAKANO-DARK;
  }

  .links {
    margin-top: 1rem;

    a {
      color: $BAKANO-PINK;
      font-weight: 500;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}

.view-all-button {
  margin-top: 1rem;
  background-color: $BAKANO-PINK;
  color: $white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;

  &:hover {
    background-color: darken($BAKANO-PINK, 10%);
  }
}
</style>
