<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useMVP } from '../../composables/useMVP'
import { useConfirmationDialog } from '../../composables/useConfirmationDialog'
import { useToast } from '../../composables/useToast'
import type { IMvpAccount } from '../../types/mvp.interface'
import CreateMVPAccountModal from '../../components/modals/CreateMVPAccountModal.vue'

const props = defineProps<{
  clientId: string
}>()

// Composables
const { mvpAccounts, isLoading, error, fetchMVPAccountForClient, deleteMVPAccount } = useMVP()
const { reveal } = useConfirmationDialog()
const { triggerToast } = useToast()

// Estado local
const showCreateModal = ref(false)
const isDeleting = ref(false)

// Cargar cuentas MVP al montar el componente
onMounted(async () => {
  await loadMVPAccounts()
})

// Función para cargar las cuentas MVP
async function loadMVPAccounts() {
  try {
    await fetchMVPAccountForClient(props.clientId)
  } catch (err: any) {
    // Si es un 404, no mostramos error porque simplemente no hay cuentas
    if (err && typeof err === 'object' && 'status' in err && err.status === 404) {
      return
    }
    // Para otros errores, mostramos un mensaje genérico
    console.error('Error al cargar cuentas MVP:', err)
  }
}

// Función para eliminar una cuenta MVP
async function handleDeleteAccount(account: IMvpAccount) {
  try {
    isDeleting.value = true

    const confirmed = await reveal({
      title: 'Eliminar Cuenta MVP',
      message: `¿Estás seguro de que deseas eliminar la cuenta MVP? Esta acción no se puede deshacer.`,
      confirmationText: 'ELIMINAR'
    })

    if (confirmed) {
      // Pasamos el ID del cliente
      await deleteMVPAccount(props.clientId)
      triggerToast('Cuenta MVP eliminada correctamente', 'success')
    }
  } catch (err) {
    console.error('Error al eliminar cuenta MVP:', err)
    triggerToast('Error al eliminar la cuenta MVP', 'error')
  } finally {
    isDeleting.value = false
  }
}

// Función para manejar la creación exitosa de una cuenta
function handleAccountCreated() {
  showCreateModal.value = false
  triggerToast('Cuenta MVP creada exitosamente', 'success')
}

// Determinar si mostrar el estado vacío
const showEmptyState = computed(() => {
  return !isLoading.value && !error.value && (!mvpAccounts.value || mvpAccounts.value.length === 0)
})

// Determinar si mostrar el estado de error
const showErrorState = computed(() => {
  return !isLoading.value && error.value !== null
})

// Formatear fecha
function formatDate(date: string | Date | undefined) {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<template>
  <section class="card mvp-accounts-section">
    <div class="card-header">
      <div class="header-title">
        <i class="fas fa-crown header-icon"></i>
        <h3>Cuentas MVP</h3>
      </div>
      <button 
        v-if="mvpAccounts && mvpAccounts.length > 0" 
        @click="showCreateModal = true" 
        class="btn-create btn-add"
      >
        <i class="fas fa-plus-circle"></i> Crear Nueva
      </button>
    </div>
    
    <!-- Estado de carga -->
    <div v-if="isLoading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i> Cargando cuentas MVP...
    </div>
    
    <!-- Estado de error -->
    <div v-else-if="showErrorState" class="error-state">
      <i class="fas fa-exclamation-triangle"></i>
      <p>Ha ocurrido un error al cargar las cuentas MVP. Por favor, inténtalo de nuevo.</p>
      <button @click="loadMVPAccounts" class="btn btn-outline-primary retry-btn">
        <i class="fas fa-sync"></i> Reintentar
      </button>
    </div>
    
    <!-- Estado vacío -->
    <div v-else-if="showEmptyState" class="empty-state">
      <i class="fas fa-crown empty-icon"></i>
      <p>Este cliente aún no tiene cuentas MVP.</p>
      <button @click="showCreateModal = true" class="btn btn-primary btn-lg create-first-btn">
        <i class="fas fa-plus-circle"></i> Crear Primera Cuenta MVP
      </button>
    </div>
    
    <!-- Lista de cuentas MVP -->
    <div v-else class="mvp-accounts-list">
      <div v-for="account in mvpAccounts" :key="account._id" class="mvp-account-card">
        <div class="card-inner">
          <!-- Encabezado con nombre y tipo -->
          <div class="account-header">
            <h4 class="account-name" :title="account.accountInfo?.firstName + ' ' + account.accountInfo?.lastName">
              {{ account.accountInfo?.firstName }} {{ account.accountInfo?.lastName }}
            </h4>
            <div class="badge-container">
              <span class="account-type" :title="account.mvpType">{{ account.mvpType }}</span>
            </div>
          </div>
          
          <!-- Detalles de la cuenta -->
          <div class="account-details">
            <div class="detail-row">
              <span class="detail-label">Email:</span>
              <span class="detail-value" :title="account.accountInfo?.email">{{ account.accountInfo?.email }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Creada:</span>
              <span class="detail-value">{{ formatDate(account.createdAt) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Estado:</span>
              <span :class="['status-badge', account.active ? 'active' : 'inactive']">
                {{ account.active ? 'Activa' : 'Inactiva' }}
              </span>
            </div>
          </div>
          
          <!-- Botón de eliminar -->
          <div class="account-actions">
            <button 
              @click="handleDeleteAccount(account)" 
              class="btn-delete btn-icon" 
              :disabled="isDeleting"
              title="Eliminar cuenta"
              aria-label="Eliminar cuenta"
            >
              <i v-if="isDeleting" class="fas fa-spinner fa-spin"></i>
              <i v-else class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal para crear cuenta MVP -->
    <CreateMVPAccountModal
      v-if="showCreateModal"
      :client-id="clientId"
      @close="showCreateModal = false"
      @created="handleAccountCreated"
    />
  </section>
</template>

<style scoped lang="scss">
@use '@/styles/index.scss' as *;

.mvp-accounts-section {
  margin-bottom: 1.5rem;
  max-width: 100%;
  overflow-x: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid rgba($BAKANO-LIGHT, 0.7);
  flex-wrap: wrap;
  gap: 0.75rem;

  .header-title {
    display: flex;
    align-items: center;
    gap: 0.75rem;

    .header-icon {
      color: $BAKANO-PURPLE;
      font-size: 1.25rem;
      flex-shrink: 0;
    }

    h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: $BAKANO-DARK;
      white-space: nowrap;
    }
  }

  @media (max-width: 480px) {
    padding: 0.75rem 1rem;

    .header-title h3 {
      font-size: 1.1rem;
    }
  }
}

.loading-state,
.empty-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  color: rgba($BAKANO-DARK, 0.7);
  font-family: $font-secondary;
}

.empty-icon {
  font-size: 3rem;
  color: rgba($BAKANO-PURPLE, 0.3);
  margin-bottom: 1rem;
}

.error-state {
  color: $BAKANO-PINK;

  i {
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  p {
    margin-bottom: 1.5rem;
  }
}

.retry-btn {
  margin-top: 1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;

  i {
    font-size: 1rem;
  }
}

.btn-outline-primary {
  background: transparent;
  border: 1px solid $BAKANO-PINK;
  color: $BAKANO-PINK;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s ease;

  &:hover {
    background: $BAKANO-PINK;
    color: $white;
  }
}

.btn-create {
  background-color: $BAKANO-PURPLE;
  color: $white;
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba($BAKANO-PURPLE, 0.2);

  &:hover {
    background-color: darken($BAKANO-PURPLE, 5%);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba($BAKANO-PURPLE, 0.3);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba($BAKANO-PURPLE, 0.2);
  }
}

.btn-add {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  min-width: 120px;

  i {
    font-size: 1.1rem;
  }
}

.create-first-btn {
  margin-top: 1.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba($BAKANO-PURPLE, 0.15);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba($BAKANO-PURPLE, 0.25);
  }

  &:active {
    transform: translateY(0);
  }
}

.mvp-accounts-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  padding: 0.5rem;
  width: 100%;
  overflow-x: hidden;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
}

.mvp-account-card {
  background: $white;
  border: 1px solid $BAKANO-LIGHT;
  border-radius: 12px;
  position: relative;
  transition: all 0.2s ease;
  width: 100%;
  min-width: 0;
  overflow: hidden;

  &:hover {
    box-shadow: 0 5px 15px rgba($BAKANO-PURPLE, 0.1);
    transform: translateY(-2px);
  }

  .card-inner {
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    height: 100%;
    position: relative;
  }

  .account-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    width: 100%;
    position: relative;
    padding-right: 2rem;
    /* Espacio para el botón de eliminar */

    .account-name {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: $BAKANO-DARK;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      line-clamp: 1;
      -webkit-box-orient: vertical;
      max-width: calc(100% - 90px);
    }

    .badge-container {
      flex-shrink: 0;
      margin-left: 0.5rem;
    }

    .account-type {
      font-size: 0.75rem;
      background: $overlay-purple;
      color: $BAKANO-PURPLE;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-weight: 500;
      white-space: nowrap;
      display: inline-block;
    }
  }

  .account-details {
    margin-bottom: 1rem;

    .detail-row {
      display: flex;
      margin-bottom: 0.5rem;
      align-items: baseline;
      flex-wrap: wrap;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .detail-label {
      color: rgba($BAKANO-DARK, 0.7);
      font-weight: 600;
      font-size: 0.9rem;
      margin-right: 0.5rem;
      flex-shrink: 0;
      min-width: 60px;
    }

    .detail-value {
      font-size: 0.9rem;
      color: $BAKANO-DARK;
      overflow: hidden;
      text-overflow: ellipsis;
      word-break: break-word;
      flex: 1;
      min-width: 0;
    }

    .status-badge {
      font-size: 0.8rem;
      font-weight: 600;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      display: inline-block;

      &.active {
        background: lighten($BAKANO-GREEN, 40%);
        color: darken($BAKANO-GREEN, 10%);
      }

      &.inactive {
        background: lighten($BAKANO-PINK, 40%);
        color: darken($BAKANO-PINK, 10%);
      }
    }
  }

  .account-actions {
    position: absolute;
    top: 1.25rem;
    right: 1.25rem;
    z-index: 5;

    .btn-delete {
      background: none;
      border: none;
      color: rgba($BAKANO-DARK, 0.3);
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 50%;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;

      &:hover:not(:disabled) {
        background: lighten($BAKANO-PINK, 40%);
        color: $BAKANO-PINK;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }

  .btn-icon {
    font-size: 1rem;

    i {
      display: inline-block;
      width: 1em;
      height: 1em;
      line-height: 1;
    }
  }
}
</style>