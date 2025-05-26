<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import useClientAndBusinessStore from '@/stores/clientAndBusiness'

const route = useRoute()
const router = useRouter()
const store = useClientAndBusinessStore()

const clientId = route.params.clientId as string

onMounted(async () => {
  await store.fetchClientWithDetails(clientId)
})

const goToBusiness = (businessId: string) => {
  router.push({ name: 'businessDetails', params: { clientId, businessId } })
}

const hasAttachedFiles = (biz: any) => {
  return (
    biz.menuRestaurantePath ||
    biz.costoPorPlatoPath ||
    biz.ventasClientePath ||
    biz.ventasMovimientosPath ||
    biz.ventasProductosPath
  )
}

</script>

<template>
  <div class="businesses-view">
    <h1>Todos los negocios de {{ store.client?.name }}</h1>

    <div v-if="store.isLoading" class="loading">
      <i class="fas fa-spinner fa-spin"></i> Cargando negocios...
    </div>

    <div v-else-if="store.businesses.length === 0">
      No hay negocios registrados.
    </div>

    <div v-else class="businesses-list">
      <div
        class="business-card"
        v-for="biz in store.businesses"
        :key="biz._id"
        :class="{ 'disabled': !hasAttachedFiles(biz) }"
      >
        <h3>{{ biz.name }}</h3>
        <p><strong>RUC:</strong> {{ biz.ruc }}</p>
        <p><strong>Teléfono:</strong> {{ biz.phone }}</p>
        <p><strong>Dirección:</strong> {{ biz.address }}</p>
        <p><strong>Categoría:</strong> {{ biz.category || 'No especificada' }}</p>

        <p v-if="hasAttachedFiles(biz)" class="tag success">✔️ Archivos disponibles</p>
        <p v-else class="tag warning">⚠️ No hay archivos subidos aún</p>

        <button
          v-if="hasAttachedFiles(biz)"
          class="open-button"
          @click="goToBusiness(biz._id)"
        >
          Abrir negocio
        </button>
      </div>
    </div>
  </div>
</template>


<style scoped lang="scss">
@use '@/styles/index.scss' as *;

.businesses-view {
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
  font-family: $font-principal;

  h1 {
    font-size: 2rem;
    margin-bottom: 1.5rem;
    color: $BAKANO-DARK;
    font-weight: 600;
  }

  .loading {
    text-align: center;
    color: $BAKANO-PINK;
    font-size: 1rem;
    margin-top: 2rem;

    i {
      margin-right: 0.5rem;
    }
  }
}

.businesses-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.business-card {
  border: 2px solid $BAKANO-PURPLE;
  padding: 1.5rem;
  border-radius: 12px;
  background: $white;
  cursor: default;
  transition: all 0.2s ease;
  box-shadow: 0 4px 10px rgba($BAKANO-PURPLE, 0.05);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba($BAKANO-PURPLE, 0.15);
  }

  h3 {
    font-size: 1.3rem;
    margin-bottom: 0.5rem;
    color: $BAKANO-DARK;
    font-weight: 600;
  }

  p {
    margin: 0.3rem 0;
    font-size: 0.95rem;
    color: $BAKANO-DARK;

    strong {
      color: $BAKANO-PURPLE;
    }
  }

  .tag {
    margin-top: 0.8rem;
    font-weight: 500;
    font-size: 0.9rem;
    padding: 0.3rem 0.7rem;
    border-radius: 8px;
    display: inline-block;
  }

  .success {
    background: rgba(green, 0.1);
    color: green;
  }

  .warning {
    background: rgba($BAKANO-PINK, 0.08);
    color: $BAKANO-PINK;
  }

  .open-button {
    margin-top: 1rem;
    background-color: $BAKANO-PINK;
    color: $white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: darken($BAKANO-PINK, 10%);
    }
  }
}

.disabled {
  pointer-events: none;
  opacity: 0.6;
  cursor: not-allowed;
  border: 2px dashed rgba($BAKANO-PURPLE, 0.3);
}
</style>
