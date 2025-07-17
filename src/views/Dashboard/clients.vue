<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'
import { format } from 'date-fns'
import { useSearchStore } from '@/stores/search'
import { useRouter } from 'vue-router'
import GlobalSearchBar from '@/components/shared/GlobalSearchBar.vue'

const router = useRouter()
const searchStore = useSearchStore()

watch(
  () => searchStore.state.searchTerm,
  (newTerm) => {
    searchStore.executeSearch(newTerm)
  }
)

onMounted(() => {
  if (!searchStore.state.searchTerm) {
    searchStore.fetchAllClients()
  }
})

onUnmounted(() => {
  searchStore.executeSearch('')
})

const formatDate = (date: string) => (date ? format(new Date(date), 'dd MMM yyyy HH:mm') : '')
</script>

<template>
  <div class="clients-dashboard">
    <div class="header-container">
      <h2 v-if="!searchStore.state.searchTerm" class="section-title">Últimos Clientes</h2>
      <h2 v-else class="section-title">Resultados de la Búsqueda</h2>

      <GlobalSearchBar
        v-model="searchStore.state.searchTerm"
        placeholder="Buscar por cliente, negocio, email, RUC..."
        :is-loading="searchStore.state.isLoading"
      />
    </div>

    <div v-if="searchStore.state.isLoading" class="loading">
      <i class="fas fa-spinner fa-spin"></i>
      <span v-if="searchStore.state.searchTerm">Buscando...</span>
      <span v-else>Cargando clientes...</span>
    </div>

    <div v-else-if="searchStore.state.displayList.length > 0" class="clients-list">
      <div
        class="client-card"
        v-for="client in searchStore.state.displayList"
        :key="client._id"
        @click="router.push(`/client/${client._id}`)"
      >
        <i class="fas fa-arrow-up-right-from-square open-link-icon"></i>
        <div class="client-info">
          <h3>{{ client.name }}</h3>
          <p><strong>Correo:</strong> {{ client.email }}</p>
          <p><strong>Teléfono:</strong> {{ client.phone }}</p>
        </div>
        <div v-if="client.paymentInfo" class="payment-info">
          <p><strong>Último Pago:</strong> {{ formatDate(client.paymentInfo.lastPaymentDate) }}</p>
        </div>
        <div v-if="client.businesses && client.businesses.length > 0" class="business-info">
          <h4>Negocios:</h4>
          <ul>
            <li v-for="biz in client.businesses" :key="biz._id">{{ biz.name }}</li>
          </ul>
        </div>
      </div>
    </div>

    <div v-else-if="searchStore.state.searchTerm" class="empty-state">
      <i class="fas fa-search-minus"></i>
      <p>No se encontraron resultados para "<strong>{{ searchStore.state.searchTerm }}</strong>".</p>
    </div>

    <div v-else class="empty-state">
      <i class="fas fa-users-slash"></i>
      <p>No hay clientes registrados.</p>
    </div>

    <div
      v-if="searchStore.state.pagination && searchStore.state.pagination.totalPages > 1"
      class="pagination"
    >
      <button
        @click="searchStore.goToPage(searchStore.state.pagination.page - 1)"
        :disabled="searchStore.state.pagination.page <= 1"
      >
        Anterior
      </button>
      <span>Página {{ searchStore.state.pagination.page }} de {{ searchStore.state.pagination.totalPages }}</span>
      <button
        @click="searchStore.goToPage(searchStore.state.pagination.page + 1)"
        :disabled="searchStore.state.pagination.page >= searchStore.state.pagination.totalPages"
      >
        Siguiente
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/index.scss' as *;

.clients-dashboard {
  margin-top: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.header-container {
  padding: 0 1rem;
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.5rem;
  color: $BAKANO-DARK;
  margin-bottom: 1rem;
  font-weight: 600;
}

.loading,
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  font-size: 1rem;
  color: rgba($BAKANO-DARK, 0.7);

  i {
    font-size: 2rem;
    margin-bottom: 1rem;
    display: block;
    color: $BAKANO-PURPLE;
  }
}

.clients-list {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  padding: 0 1rem;
}

.client-card {
  position: relative;
  background: $white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba($BAKANO-PURPLE, 0.06);
  padding: 1.5rem;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 16px rgba($BAKANO-PURPLE, 0.12);

    .open-link-icon {
      color: $BAKANO-PINK;
      transform: scale(1.1);
    }
  }

  h3 {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
    color: $BAKANO-DARK;
  }

  p {
    margin: 0.25rem 0;
    color: $BAKANO-DARK;
    font-size: 0.95rem;

    strong {
      color: $BAKANO-PURPLE;
    }
  }
}

.open-link-icon {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  font-size: 1rem;
  color: rgba($BAKANO-PURPLE, 0.5);
  transition: all 0.3s ease;
}

.payment-info,
.business-info {
  margin-top: 1rem;
  border-top: 1px solid $BAKANO-LIGHT;
  padding-top: 1rem;
}

.business-info {
  h4 {
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
    color: $BAKANO-DARK;
  }

  ul {
    list-style: none;
    padding-left: 0;
    margin: 0;
  }

  li {
    padding: 0.2rem 0;
    font-size: 0.9rem;
    color: rgba($BAKANO-DARK, 0.8);
  }
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding: 1rem;

  button {
    padding: 0.5rem 1rem;
    border: 1px solid $BAKANO-PURPLE;
    background: transparent;
    color: $BAKANO-PURPLE;
    border-radius: 6px;
    cursor: pointer;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}
</style>