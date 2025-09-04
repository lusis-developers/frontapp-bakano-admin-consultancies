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
      <i class="fas fa-crown header-icon"></i>
      <h3>Cuentas MVP</h3>
      <button 
        v-if="mvpAccounts && mvpAccounts.length > 0" 
        @click="showCreateModal = true" 
        class="btn-subtle btn-add"
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
        <div class="account-header">
          <h4>{{ account.accountInfo?.firstName }} {{ account.accountInfo?.lastName }}</h4>
          <span class="account-type">{{ account.mvpType }}</span>
        </div>
        
        <div class="account-details">
          <p><strong>Email:</strong> {{ account.accountInfo?.email }}</p>
          <p><strong>Creada:</strong> {{ formatDate(account.createdAt) }}</p>
          <p><strong>Estado:</strong> <span :class="['status-badge', account.active ? 'active' : 'inactive']">{{ account.active ? 'Activa' : 'Inactiva' }}</span></p>
        </div>
        
        <div class="account-actions">
          <button 
            @click="handleDeleteAccount(account)" 
            class="btn-delete btn-icon" 
            :disabled="isDeleting"
            title="Eliminar cuenta"
          >
            <i v-if="isDeleting" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-trash"></i>
          </button>
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

.btn-add {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  
  i {
    font-size: 1.1rem;
  }
  
  &:hover {
    transform: translateY(-1px);
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
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  padding: 0.5rem;
}

.mvp-account-card {
  background: $white;
  border: 1px solid $BAKANO-LIGHT;
  border-radius: 12px;
  padding: 1.25rem;
  position: relative;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 5px 15px rgba($BAKANO-PURPLE, 0.1);
    transform: translateY(-3px);
  }

  .account-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;

    h4 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: $BAKANO-DARK;
    }

    .account-type {
      font-size: 0.8rem;
      background: $overlay-purple;
      color: $BAKANO-PURPLE;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-weight: 500;
    }
  }

  .account-details {
    p {
      margin: 0.5rem 0;
      font-size: 0.95rem;

      strong {
        color: rgba($BAKANO-DARK, 0.7);
      }
    }

    .status-badge {
      font-size: 0.8rem;
      font-weight: 600;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;

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
    top: 1rem;
    right: 1rem;

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
      width: 36px;
      height: 36px;

      &:hover:not(:disabled) {
        background: lighten($BAKANO-PINK, 40%);
        color: $BAKANO-PINK;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
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
}
</style>