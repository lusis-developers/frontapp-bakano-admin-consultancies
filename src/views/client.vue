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

const goToBusiness = (businessId: string) => {
  router.push(`/client/${clientId}/business/${businessId}`)
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

      <section v-if="store.client.businesses?.length" class="card">
        <h3>Negocios Asociados</h3>
        <div class="business-grid">
          <div
            class="business-card"
            v-for="biz in store.client.businesses"
            :key="biz._id"
            @click="goToBusiness(biz._id)"
          >
            <h4>{{ biz.name }}</h4>
            <p><strong>RUC:</strong> {{ biz.ruc }}</p>
            <p><strong>Teléfono:</strong> {{ biz.phone }}</p>
            <p><strong>Email:</strong> {{ biz.email }}</p>
            <p><strong>Dirección:</strong> {{ biz.address }}</p>
            <p><strong>Categoría:</strong> {{ biz.category || 'No especificada' }}</p>

            <div class="links">
              <p><strong>Archivos:</strong></p>
              <ul>
                <li v-if="biz.menuRestaurantePath"><a :href="biz.menuRestaurantePath" target="_blank">📋 Menú</a></li>
                <li v-if="biz.costoPorPlatoPath"><a :href="biz.costoPorPlatoPath" target="_blank">💰 Costos</a></li>
                <li v-if="biz.ventasClientePath"><a :href="biz.ventasClientePath" target="_blank">📊 Ventas Cliente</a></li>
                <li v-if="biz.ventasMovimientosPath"><a :href="biz.ventasMovimientosPath" target="_blank">📈 Movimientos</a></li>
                <li v-if="biz.ventasProductosPath"><a :href="biz.ventasProductosPath" target="_blank">🧾 Productos</a></li>
                <li
                  v-if="!biz.menuRestaurantePath && !biz.costoPorPlatoPath && !biz.ventasClientePath && !biz.ventasMovimientosPath && !biz.ventasProductosPath"
                >
                  No hay archivos subidos aún.
                </li>
              </ul>
            </div>
          </div>
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
</style>
