<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import useClientAndBusinessStore from '@/stores/clientAndBusiness'
import type { IManager } from '@/types/manager.interface'
import ManagersCard from './components/ManagersCard.vue'
import EditBusinessModal from './components/EditBusinessModal.vue'
import type { Business } from '@/types/business.interface'

const route = useRoute()
const clientId = route.params.clientId as string
const businessId = route.params.businessId as string

const store = useClientAndBusinessStore()

const copiedField = ref<string | null>(null)
const isEditModalVisible = ref(false)

const copyToClipboard = async (textToCopy: string, fieldName: string) => {
  if (!textToCopy) return

  try {
    await navigator.clipboard.writeText(textToCopy)
    copiedField.value = fieldName
    setTimeout(() => {
      copiedField.value = null
    }, 2000)
  } catch (err) {
    console.error('Error al copiar:', err)
  }
}

const handleSaveChanges = async (updatedData: Partial<Business>) => {
  try {
    await store.updateBusinessDetails(updatedData);
    isEditModalVisible.value = false;
    console.log('estamos guardando')
  } catch (error) {
    alert('No se pudieron guardar los cambios.');
  }
};

const handleAddManager = async (managerData: Omit<IManager, '_id'>) => {
  await store.addManager(managerData)
}
const handleRemoveManager = async (managerId: string) => {
  await store.removeManager(managerId)
}

const menuPaths = computed(() => {
  const path = store.selectedBusiness?.menuRestaurantePath
  if (Array.isArray(path)) {
    return path
  }
  if (typeof path === 'string' && path) {
    return [path]
  }
  return []
})

onMounted(async () => {
  await store.fetchClientAndBusiness(clientId, businessId)
})

</script>

<template>
  <div class="business-details-view">
    <h1 class="page-title">Detalles del Negocio</h1>

     <button v-if="store.selectedBusiness" @click="isEditModalVisible = true" class="btn btn-primary">
        <i class="fas fa-pencil-alt"></i> Editar Negocio
      </button>

    <div v-if="store.isLoading && !store.selectedBusiness" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i> Cargando información...
    </div>
    <div v-else-if="store.error" class="error-state">
      <p><strong>Error al cargar los datos</strong></p>
      <p>{{ store.error.message }}</p>
    </div>

    <div v-else-if="store.selectedBusiness" class="details-grid">
      <div class="card info-card">
        <h2>{{ store.selectedBusiness.name }}</h2>
        <p><strong>RUC/ID:</strong> <span class="copyable-text" @click="copyToClipboard(store.selectedBusiness.ruc, 'ruc')">{{ store.selectedBusiness.ruc }}<i class="fas fa-copy copy-icon"></i></span><span v-if="copiedField === 'ruc'" class="copy-feedback">✓</span></p>
        <p><strong>Teléfono:</strong> <span class="copyable-text" @click="copyToClipboard(store.selectedBusiness.phone!, 'phone')">{{ store.selectedBusiness.phone }}<i class="fas fa-copy copy-icon"></i></span><span v-if="copiedField === 'phone'" class="copy-feedback">✓</span></p>
        <p><strong>Email:</strong> <span class="copyable-text" @click="copyToClipboard(store.selectedBusiness.email!, 'email')">{{ store.selectedBusiness.email }}<i class="fas fa-copy copy-icon"></i></span><span v-if="copiedField === 'email'" class="copy-feedback">✓</span></p>
        <p><strong>Dirección:</strong> <span class="copyable-text" @click="copyToClipboard(store.selectedBusiness.address!, 'address')">{{ store.selectedBusiness.address }}<i class="fas fa-copy copy-icon"></i></span><span v-if="copiedField === 'address'" class="copy-feedback">✓</span></p>
        <p><strong>Objetivo:</strong> {{ store.selectedBusiness.objetivoIdeal || 'No especificado' }}</p>
        <p><strong>Desafío Principal:</strong> {{ store.selectedBusiness.desafioPrincipal || 'No especificado' }}</p>
      </div>

      <div class="card attachments-card">
        <h3>Archivos Adjuntos</h3>
        <ul class="file-list">
          <li v-for="(menuUrl, index) in menuPaths" :key="menuUrl">
            <a :href="menuUrl" target="_blank" rel="noopener noreferrer">
              <i class="icon">📋</i>
              <span class="file-name">Menú {{ menuPaths.length > 1 ? index + 1 : '' }}</span>
              <i class="fas fa-external-link-alt link-icon"></i>
            </a>
          </li>
          <li v-if="store.selectedBusiness.costoPorPlatoPath"><a :href="store.selectedBusiness.costoPorPlatoPath" target="_blank"><i class="icon">💰</i><span class="file-name">Costos por Plato</span><i class="fas fa-external-link-alt link-icon"></i></a></li>
          <li v-if="store.selectedBusiness.ventasClientePath"><a :href="store.selectedBusiness.ventasClientePath" target="_blank"><i class="icon">📊</i><span class="file-name">Ventas por Cliente</span><i class="fas fa-external-link-alt link-icon"></i></a></li>
          <li v-if="store.selectedBusiness.ventasMovimientosPath"><a :href="store.selectedBusiness.ventasMovimientosPath" target="_blank"><i class="icon">📈</i><span class="file-name">Reporte de Movimientos</span><i class="fas fa-external-link-alt link-icon"></i></a></li>
          <li v-if="store.selectedBusiness.ventasProductosPath"><a :href="store.selectedBusiness.ventasProductosPath" target="_blank"><i class="icon">🧾</i><span class="file-name">Ventas por Producto</span><i class="fas fa-external-link-alt link-icon"></i></a></li>
          <li class="empty-state" v-if="!menuPaths.length && !store.selectedBusiness.costoPorPlatoPath && !store.selectedBusiness.ventasClientePath && !store.selectedBusiness.ventasMovimientosPath && !store.selectedBusiness.ventasProductosPath">
            No hay archivos adjuntos.
          </li>
        </ul>
      </div>
      <div class="card-wrapper full-width">
        <ManagersCard
          :managers="store.selectedBusiness.managers || []"
          :is-loading="store.isLoading"
          @add-manager="handleAddManager"
          @remove-manager="handleRemoveManager"
        />
      </div>
      </div>
        <EditBusinessModal
          v-if="store.selectedBusiness"
          :is-visible="isEditModalVisible"
          :business="store.selectedBusiness"
          @close="isEditModalVisible = false"
          @save="handleSaveChanges"
          :is-loading="store.isLoading"
        />
      </div>
</template>

<style scoped lang="scss">
@use '@/styles/index.scss' as *;

/* --- Layout Principal --- */
.business-details-view {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
  font-family: $font-secondary;
}

.page-title {
  font-family: $font-principal;
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  color: $BAKANO-DARK;
  font-weight: 700;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-family: $font-principal;
  font-weight: 600;
  background-color: $BAKANO-PURPLE;
  color: $white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 24px;

  &:hover {
    background-color: darken($BAKANO-PURPLE, 8%);
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba($BAKANO-PURPLE, 0.3);
  }
}

.loading-state,
.error-state {
  text-align: center;
  padding: 4rem 1rem;
  font-size: 1.1rem;
  color: rgba($BAKANO-DARK, 0.6);
  background-color: $white;
  border-radius: 12px;
}

.error-state {
  color: $BAKANO-PINK;
  border: 1px solid lighten($BAKANO-PINK, 30%);
}

.details-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @media (min-width: 1024px) {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-around;

    >*:nth-child(1),
    >*:nth-child(2) {
      justify-content: space-around;
      width: 40%;
    }

    >*:nth-child(3) {
      width: 90%;
    }
  }
}

.card,
.card-wrapper {
  background: $white;
  border: 1px solid $BAKANO-LIGHT;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba($BAKANO-DARK, 0.03);
}

.card-wrapper {
  display: flex;
  flex-direction: column;

  &> :deep(.card) {
    border: none;
    padding: 0;
    box-shadow: none;
  }
}

.card {

  h2,
  h3 {
    font-family: $font-principal;
    font-weight: 600;
    color: $BAKANO-DARK;
    margin-top: 0;
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid $BAKANO-LIGHT;
  }

  h2 {
    font-size: 1.5rem;
  }

  h3 {
    font-size: 1.1rem;
  }

  p {
    margin: 0.75rem 0;
    line-height: 1.6;
    color: rgba($BAKANO-DARK, 0.8);

    strong {
      color: $BAKANO-PURPLE;
      font-weight: 600;
    }
  }
}

.copyable-text {
  cursor: pointer;
  padding: 0.1rem 0.2rem;
  border-radius: 4px;
  transition: all 0.2s ease-out;

  .copy-icon {
    margin-left: 0.5rem;
    color: rgba($BAKANO-PURPLE, 0.4);
    opacity: 0;
    transition: all 0.2s;
    font-size: 0.8em;
  }

  &:hover {
    background-color: $overlay-purple;
    color: $BAKANO-PURPLE;

    .copy-icon {
      opacity: 1;
      transform: scale(1.1);
    }
  }
}

.copy-feedback {
  color: $BAKANO-GREEN;
  font-weight: 700;
  font-size: 0.9em;
  margin-left: 0.5rem;
}


.attachments-card {
  h3 {
    margin-bottom: 1rem;
  }
}

.file-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  li a {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    background-color: lighten($BAKANO-LIGHT, 2%);
    border-radius: 8px;
    border: 1px solid transparent;
    text-decoration: none;
    color: $BAKANO-DARK;
    font-weight: 500;
    transition: all 0.2s ease-in-out;

    .icon {
      font-style: normal;
      font-size: 1.2rem;
    }

    .file-name {
      flex-grow: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .link-icon {
      color: rgba($BAKANO-PURPLE, 0.5);
      transition: transform 0.2s ease;
    }

    &:hover {
      border-color: $BAKANO-PURPLE;
      background-color: $white;
      box-shadow: 0 4px 10px $overlay-purple;
      color: $BAKANO-PURPLE;

      .link-icon {
        transform: scale(1.2);
      }
    }
  }

  .empty-state {
    font-style: italic;
    color: rgba($BAKANO-DARK, 0.5);
    padding: 1rem;
    text-align: center;
  }
}

@media (min-width: 960px) {}
</style>