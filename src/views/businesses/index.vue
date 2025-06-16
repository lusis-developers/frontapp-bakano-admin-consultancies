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

    <div v-else-if="store.businesses.length === 0" class="empty-state">
      Aún no hay negocios registrados para este cliente.
    </div>

    <div v-else class="businesses-list">
      <div
        class="business-card"
        v-for="biz in store.businesses"
        :key="biz._id"
        :class="{ 'disabled': !hasAttachedFiles(biz) }"
        @click="hasAttachedFiles(biz) && goToBusiness(biz._id)"
      >
        <i v-if="hasAttachedFiles(biz)" class="fas fa-chevron-right open-icon"></i>

        <h3>{{ biz.name }}</h3>
        <p><strong>RUC:</strong> {{ biz.ruc }}</p>
        <p><strong>Teléfono:</strong> {{ biz.phone }}</p>
        <p><strong>Dirección:</strong> {{ biz.address }}</p>
        <p><strong>Categoría:</strong> {{ biz.category || 'No especificada' }}</p>

        <p v-if="hasAttachedFiles(biz)" class="tag success">✔️ Archivos disponibles</p>
        <p v-else class="tag warning">⚠️ Requiere archivos</p>

        </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/index.scss' as *;

.businesses-view {
  padding: 2rem 1rem;
  max-width: 1200px; // Un poco más de espacio
  margin: 0 auto;
  font-family: $font-principal;

  h1 {
    font-size: 2rem;
    margin-bottom: 1.5rem;
    color: $BAKANO-DARK;
    font-weight: 600;
  }

  .loading,
  .empty-state {
    text-align: center;
    color: $BAKANO-PURPLE;
    font-size: 1rem;
    margin-top: 2rem;

    i {
      margin-right: 0.5rem;
    }
  }
}

.businesses-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); // Tarjetas un poco más anchas
  gap: 1.5rem;
}

.business-card {
  position: relative; // Necesario para posicionar el ícono
  border: 1px solid rgba($BAKANO-PURPLE, 0.5);
  padding: 1.5rem;
  border-radius: 12px;
  background: $white;
  transition: all 0.25s ease;
  box-shadow: 0 4px 10px rgba($BAKANO-PURPLE, 0.05);

  // El cursor es 'pointer' solo si la tarjeta NO está deshabilitada
  &:not(.disabled) {
    cursor: pointer;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 20px rgba($BAKANO-PURPLE, 0.15);
      border-color: $BAKANO-PINK;

      // El ícono reacciona al hover de la tarjeta
      .open-icon {
        color: $BAKANO-PINK;
        transform: scale(1.1);
      }
    }
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
    margin-top: 1rem;
    margin-bottom: 0.5rem;
    font-weight: 500;
    font-size: 0.9rem;
    padding: 0.3rem 0.7rem;
    border-radius: 16px; // Más redondeado
    display: inline-block;
  }

  .success {
    background: rgba(40, 167, 69, 0.1);
    color: #218838;
  }

  .warning {
    background: rgba($BAKANO-PINK, 0.08);
    color: $BAKANO-PINK;
  }
}

.open-icon {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  font-size: 1.2rem;
  color: rgba($BAKANO-PURPLE, 0.6);
  transition: all 0.25s ease;
}

.disabled {
  background: rgba($BAKANO-DARK, 0.02);
  opacity: 0.7;
  cursor: not-allowed;
  border: 1px dashed rgba($BAKANO-PURPLE, 0.4);

  &:hover {
    transform: none;
    box-shadow: 0 4px 10px rgba($BAKANO-PURPLE, 0.05);
  }
}
</style>