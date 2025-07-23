<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { format } from 'date-fns'
import useClientAndBusinessStore from '@/stores/clientAndBusiness'
import { MeetingStatus, MeetingType } from '@/enums/meetingStatus.enum'
import TransactionList from './client/TransactionList.vue'
import AssignMeeting from './client/AssignMeeting.vue'
import { useConfirmationDialog } from '@/composables/useConfirmationDialog'
import { useToast } from '@/composables/useToast'

// --- SETUP ---
const route = useRoute()
const router = useRouter()
const store = useClientAndBusinessStore()
const { reveal } = useConfirmationDialog()
const { triggerToast } = useToast()

const clientId = route.params.clientId as string
const transactionCurrentPage = ref(1)
const isActionLoading = ref(false)


const portfolioAccessMeeting = computed(() => {
  if (
    store.meetingStatus?.meeting?.meetingType === MeetingType.PORTFOLIO_ACCESS &&
    store.meetingStatus.meeting?.status === MeetingStatus.SCHEDULED
  ) {
    return store.meetingStatus.meeting
  }
  return null
})

const dataStrategyMeeting = computed(() => {
  if (
    store.meetingStatus?.meeting?.meetingType === MeetingType.DATA_STRATEGY &&
    store.meetingStatus.meeting?.status === MeetingStatus.SCHEDULED
  ) {
    return store.meetingStatus.meeting
  }
  return null
})

const pendingActions = computed(() => {
  const actions = []

  if (portfolioAccessMeeting.value) {
    actions.push({
      key: 'portfolio-access',
      title: 'Acceso a Portafolio Pendiente',
      description: 'Confirmar que se ha verificado el acceso al portafolio para habilitar la reunión de estrategia.',
      buttonText: 'Confirmar Acceso',
      buttonIcon: 'fa-check-circle',
      handler: requestPortfolioConfirmation,
    })
  }

  if (dataStrategyMeeting.value) {
    actions.push({
      key: 'data-strategy',
      title: 'Reunión de Estrategia Pendiente',
      description: 'Confirmar que la reunión de estrategia de datos ha sido completada exitosamente.',
      buttonText: 'Marcar como Completada',
      buttonIcon: 'fa-flag-checkered',
      handler: requestDataStrategyCompletion,
    })
  }

  return actions
})


async function requestPortfolioConfirmation() {
  if (!portfolioAccessMeeting.value || !store.client) return

  try {
    const confirmed = await reveal({
      title: 'Confirmar Verificación de Acceso',
      message: `Estás a punto de confirmar el acceso para ${store.client.name}. Al hacerlo, se habilitará la reunión de estrategia. ¿Deseas continuar?`,
    })

    if (confirmed) {
      isActionLoading.value = true
      await store.confirmPortfolioAccess(portfolioAccessMeeting.value._id)
      triggerToast('Acceso confirmado y siguiente paso habilitado.', 'success')
    }
  } catch {
    triggerToast('Acción cancelada.', 'info')
  } finally {
    isActionLoading.value = false
  }
}

async function requestDataStrategyCompletion() {
  if (!dataStrategyMeeting.value || !store.client) return

  try {
    const confirmed = await reveal({
      title: 'Confirmar Finalización de Reunión',
      message: `Vas a marcar la reunión de estrategia para ${store.client.name} como completada. Esto finalizará el paso actual. ¿Estás seguro?`,
    })

    if (confirmed) {
      isActionLoading.value = true
      // ✅ CORRECCIÓN: Usamos ._id
      await store.completeDataStrategyMeeting(dataStrategyMeeting.value._id)
      triggerToast('Reunión de estrategia completada.', 'success')
    }
  } catch {
    triggerToast('Acción cancelada.', 'info')
  } finally {
    isActionLoading.value = false
  }
}

async function handleDeleteMeeting(meeting: { _id: string; meetingType: string; scheduledTime?: string | Date }) {
  if (!meeting || !meeting._id) {
    triggerToast('Error: No se pudo identificar la reunión a eliminar.', 'error');
    return;
  }

  try {
    const confirmed = await reveal({
      title: 'Confirmar Eliminación de Reunión',
      message: `Estás a punto de eliminar permanentemente la reunión de tipo "${meeting.meetingType}" del ${formatDate(meeting.scheduledTime)}. Esta acción no se puede deshacer.`,
      confirmationText: 'ELIMINAR'
    });

    if (confirmed) {
      isActionLoading.value = true;
      const success = await store.deleteMeeting(meeting._id);
      if (success) {
        triggerToast('Reunión eliminada correctamente.', 'success');
      } else {
        triggerToast('No se pudo eliminar la reunión.', 'error');
      }
    }
  } catch {
    triggerToast('Eliminación cancelada.', 'info');
  } finally {
    isActionLoading.value = false;
  }
}

// --- LÓGICA Y CICLO DE VIDA ---
onMounted(async () => {
  await Promise.all([
    store.fetchClientWithDetails(clientId),
    store.fetchMeetingStatus(clientId),
    store.fetchMeetingsHistory(clientId),
    store.fetchTransactions(clientId, transactionCurrentPage.value),
  ])
})

const formatDate = (date?: string | Date) => (date ? format(new Date(date), 'dd MMMM, yyyy HH:mm') : 'No agendada')

const handleFilterChange = async (payload: { from: string | null; to: string | null }) => {
  await store.setTransactionFilter(clientId, payload)
  transactionCurrentPage.value = 1
}

const copyToClipboard = async (textToCopy: string | undefined) => {
  if (!textToCopy) return
  try {
    await navigator.clipboard.writeText(textToCopy)
    triggerToast('¡Copiado al portapapeles!')
  } catch (err) {
    triggerToast('Error al copiar', 'error')
  }
}

const goToBusiness = (businessId: string) => router.push({ name: 'businessDetails', params: { clientId, businessId } })
const goToAllBusinesses = () => router.push({ name: 'businesses', params: { clientId } })

const getMeetingIcon = (type: MeetingType): string => {
  const icons: Record<MeetingType, string> = {
    [MeetingType.PORTFOLIO_ACCESS]: 'fa-solid fa-folder-open',
    [MeetingType.DATA_STRATEGY]: 'fa-solid fa-chart-pie',
    [MeetingType.FOLLOW_UP]: 'fa-solid fa-clipboard-check',
    [MeetingType.TECHNICAL_SUPPORT]: 'fa-solid fa-headset',
  }
  return icons[type] || 'fa-solid fa-calendar-day'
}

const handlePageChange = (newPage: number) => { transactionCurrentPage.value = newPage }

const handleDeleteTransaction = async (transactionId: string) => {
  const success = await store.removeTransaction(transactionId)
  if (success) {
    triggerToast('Transacción eliminada correctamente.')
    if (store.transactions.length === 0 && transactionCurrentPage.value > 1) {
      transactionCurrentPage.value--
    }
  } else {
    triggerToast('Error al eliminar la transacción.', 'error')
  }
}

watch(transactionCurrentPage, (newPage) => {
  store.fetchTransactions(clientId, newPage)
})
</script>

<template>
  <div class="client-view">
    <div class="page-header">
      <h1 class="page-title">Detalles del Cliente</h1>
    </div>

    <div v-if="store.isLoading && !store.client" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i> Cargando...
    </div>
    <div v-else-if="store.error" class="error-state">
      <p><strong>Error al cargar los datos:</strong> {{ store.error.message }}</p>
    </div>

    <div v-else-if="store.client" class="details-layout">
      <div class="main-column">
        <section class="card">
          <div class="card-header">
            <i class="fas fa-user-circle header-icon"></i>
            <h2>{{ store.client.name }}</h2>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Correo Electrónico</span>
              <span class="info-value copyable" @click="copyToClipboard(store.client.email)">
                {{ store.client.email }} <i class="far fa-copy copy-icon"></i>
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">Teléfono</span>
              <span class="info-value copyable" @click="copyToClipboard(store.client.phone)">
                {{ store.client.phone }} <i class="far fa-copy copy-icon"></i>
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">Ubicación</span>
              <span class="info-value">{{ store.client.city }}, {{ store.client.country }}</span>
            </div>
          </div>
        </section>

        <section class="card" v-if="store.businesses?.length">
          <div class="card-header">
            <i class="fas fa-store header-icon"></i>
            <h3>Negocios Asociados</h3>
            <button @click="goToAllBusinesses" class="btn-subtle">Ver todos</button>
          </div>
          <div class="business-list">
            <div
              v-for="business in store.businesses"
              :key="business._id"
              class="business-item"
              @click="goToBusiness(business._id)"
            >
              <div class="business-info">
                <h4>{{ business.name }}</h4>
                <p v-if="business.ruc">RUC: {{ business.ruc }}</p>
              </div>
              <i class="fas fa-chevron-right arrow-icon"></i>
            </div>
          </div>
        </section>
      </div>

      <div class="sidebar-column">
        <section
          v-for="action in pendingActions"
          :key="action.key"
          class="card actions-card"
        >
          <h3>{{ action.title }}</h3>
          <p class="action-description">
            {{ action.description }}
          </p>
          <button @click="action.handler" :disabled="isActionLoading" class="confirm-access-button">
            <span v-if="isActionLoading">
              <i class="fas fa-spinner fa-spin"></i> Procesando...
            </span>
            <span v-else>
              <i class="fas" :class="action.buttonIcon"></i> {{ action.buttonText }}
            </span>
          </button>
        </section>

        <section class="card">
          <div class="card-header">
            <i class="fas fa-history header-icon"></i>
            <h3>Historial de Reuniones</h3>
          </div>
          <ul v-if="store.meetingsHistory?.length" class="meeting-list">
            <li v-for="meeting in store.meetingsHistory" :key="meeting._id" class="meeting-item">
              <i :class="getMeetingIcon(meeting.meetingType)" class="meeting-icon"></i>
              <div class="meeting-details">
                <span class="meeting-type-text">{{ meeting.meetingType }} con {{ meeting.assignedTo }}</span>
                <span class="meeting-time">{{ formatDate(meeting.scheduledTime) }}</span>
              </div>
              <span class="status-badge" :class="`status-${meeting.status}`">{{ meeting.status }}</span>
              
              <button 
                @click.stop="handleDeleteMeeting(meeting)" 
                class="delete-meeting-btn"
                title="Eliminar reunión"
                :disabled="isActionLoading"
              >
                <i class="fas fa-trash-alt"></i>
              </button>
            </li>
          </ul>
          <p v-else class="empty-state">No hay reuniones registradas.</p>
        </section>

        <AssignMeeting />
        <TransactionList
          :transactions="store.transactions"
          :pagination="store.pagination || null"
          :is-loading="store.isTransactionsLoading"
          @change-page="handlePageChange"
          @delete="handleDeleteTransaction"
          @filter-change="handleFilterChange"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/index.scss' as *;

.client-view {
  padding: 1.5rem;
  background-color: lighten($BAKANO-LIGHT, 3.5%);
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto 1.5rem auto;
}

.page-title {
  font-family: $font-principal;
  font-size: 1.8rem;
  font-weight: 700;
  color: $BAKANO-DARK;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 5rem 1rem;
  font-family: $font-secondary;
  color: rgba($BAKANO-DARK, 0.7);
  background-color: $white;
  border-radius: 16px;
  border: 1px solid $BAKANO-LIGHT;
}

.error-state {
  color: $BAKANO-PINK;
  border-color: lighten($BAKANO-PINK, 30%);

  p {
    margin: 0;
  }
}

.details-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

.main-column,
.sidebar-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.card {
  background: $white;
  border-radius: 16px;
  border: 1px solid $BAKANO-LIGHT;
  box-shadow: 0 5px 20px rgba($BAKANO-DARK, 0.05);
  padding: 1.5rem;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0 0 1.5rem 0;
  padding-bottom: 1rem;
  border-bottom: 1px solid $BAKANO-LIGHT;

  h2,
  h3 {
    font-family: $font-principal;
    font-weight: 600;
    color: $BAKANO-DARK;
    margin: 0;
    font-size: 1.25rem;
    flex-grow: 1;
  }
}

.header-icon {
  font-size: 1.25rem;
  color: $BAKANO-PURPLE;
  width: 24px;
  text-align: center;
}

.info-grid {
  display: grid;
  gap: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.8rem;
  color: rgba($BAKANO-DARK, 0.6);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 1rem;
  color: $BAKANO-DARK;
  font-weight: 500;
}

.copyable {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.2rem 0;

  .copy-icon {
    color: rgba($BAKANO-DARK, 0.3);
    transition: color 0.2s;
  }

  &:hover .copy-icon {
    color: $BAKANO-PURPLE;
  }
}

.btn-subtle {
  font-family: $font-principal;
  background: none;
  border: none;
  color: $BAKANO-PURPLE;
  font-weight: 600;
  cursor: pointer;
  padding: 0.2rem 0.4rem;
  border-radius: 6px;
  transition: all 0.2s ease;

  &:hover {
    background-color: $overlay-purple;
    text-decoration: none;
  }
}

.business-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.business-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 1px solid $BAKANO-LIGHT;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  .business-info {
    flex-grow: 1;
  }

  h4 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: $BAKANO-DARK;
  }

  p {
    margin: 0.1rem 0 0 0;
    font-size: 0.9rem;
    color: rgba($BAKANO-DARK, 0.6);
  }

  .arrow-icon {
    color: $BAKANO-LIGHT;
    transition: all 0.2s ease;
  }

  &:hover {
    border-color: $BAKANO-PURPLE;
    transform: translateY(-3px);
    box-shadow: 0 4px 10px $overlay-purple;

    .arrow-icon {
      color: $BAKANO-PURPLE;
      transform: translateX(5px);
    }
  }
}

.actions-card {
  border-left: 4px solid $BAKANO-PINK;
  background-color: lighten($BAKANO-PINK, 42%);

  .header-icon {
    color: $BAKANO-PINK;
  }

  h3 {
    color: darken($BAKANO-PINK, 10%);
  }
}

.action-description {
  font-size: 0.95rem;
  line-height: 1.6;
  color: darken($BAKANO-PINK, 20%);
  margin: -1rem 0 1.5rem 0;
}

.meeting-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
}

// --- ✅ REFACTORIZACIÓN A FLEXBOX ---
.meeting-item {
  display: flex; // Usamos flexbox para un alineamiento robusto.
  flex-wrap: wrap; // Permitimos que los elementos pasen a la siguiente línea en móvil.
  align-items: center; // Alineamos verticalmente todos los elementos.
  gap: 0.75rem; // Espacio consistente entre todos los elementos.
  padding: 0.8rem 0.5rem;
  border-bottom: 1px solid $BAKANO-LIGHT;

  &:last-child {
    border-bottom: none;
  }
}

.meeting-icon {
  // Ya no necesita `grid-area`.
  background-color: $overlay-purple;
  color: $BAKANO-PURPLE;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0; // Evita que el icono se encoja.
  font-size: 1rem;
}

.meeting-details {
  // Ya no necesita `grid-area`.
  flex-grow: 1; // Le decimos que ocupe todo el espacio sobrante.
  flex-basis: 200px; // Un tamaño base para ayudar al wrapping en móvil.
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  overflow: hidden;
}

.meeting-type-text {
  white-space: normal;
  word-break: break-word;
  font-weight: 500;
  color: $BAKANO-DARK;
}

.meeting-time {
  font-size: 0.85rem;
  color: rgba($BAKANO-DARK, 0.7);
}

.status-badge {
  // ✅ EMPUJAMOS EL RESTO DE ELEMENTOS A LA DERECHA
  margin-left: auto; // Este es el truco clave en Flexbox.
  font-family: $font-principal;
  font-weight: 600;
  text-transform: uppercase;
  padding: 0.3rem 0.8rem;
  border-radius: 14px;
  font-size: 0.7rem;
  letter-spacing: 0.5px;
  white-space: nowrap;

  // En móvil, reseteamos el margen para que se alinee con el botón de borrar.
  @media (max-width: 550px) {
    margin-left: 0;
    // Hacemos que ocupe todo el ancho de la "columna" de acciones.
    flex-basis: 100%;
    text-align: right;
    order: 2; // Lo ponemos después de los detalles
  }

  // Clases de estado (sin cambios)
  &.status-scheduled {
    background-color: lighten($BAKANO-PURPLE, 35%);
    color: darken($BAKANO-PURPLE, 10%);
  }

  &.status-completed {
    background-color: lighten($BAKANO-GREEN, 35%);
    color: darken($BAKANO-GREEN, 10%);
  }

  &.status-cancelled,
  &.status-no-show {
    background-color: lighten($BAKANO-PINK, 35%);
    color: darken($BAKANO-PINK, 10%);
  }

  &.status-pending-schedule {
    background-color: lighten(orange, 35%);
    color: darken(orange, 10%);
  }
}

.delete-meeting-btn {
  // El botón se sienta naturalmente al lado del status badge.
  // Ya no necesita `grid-area`.
  background: none;
  border: none;
  color: #a0aec0;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease-in-out;
  flex-shrink: 0; // Evita que el botón se encoja.

  &:hover:not(:disabled) {
    background-color: lighten($BAKANO-PINK, 40%);
    color: darken($BAKANO-PINK, 10%);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  i {
    font-size: 0.9rem;
  }

  @media (max-width: 550px) {
    // En móvil, quitamos el margen auto del status y se lo ponemos al botón
    // para que la alineación a la derecha sea consistente.
    margin-left: auto;
    order: 1; // Lo ponemos antes que el status badge en el DOM visual
  }
}

.empty-state {
  text-align: center;
  font-style: italic;
  color: rgba($BAKANO-DARK, 0.6);
  padding: 2.5rem 1rem;
  border: 2px dashed $BAKANO-LIGHT;
  border-radius: 12px;
  margin-top: 1rem;
}

.confirm-access-button {
  background-color: $BAKANO-GREEN;
  color: $white;
  border: none;
  padding: 0.7rem 1.4rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-family: $font-principal;
  font-size: 0.9rem;
  transition: all 0.2s ease-in-out;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;

  &:hover:not(:disabled) {
    background-color: darken($BAKANO-GREEN, 10%);
    box-shadow: 0 4px 12px rgba($BAKANO-GREEN, 0.2);
  }

  &:disabled {
    background-color: #9e9e9e;
    cursor: not-allowed;
    box-shadow: none;
  }
}

@media (min-width: 1024px) {
  .details-layout {
    grid-template-columns: 2fr 1fr;
    align-items: start;
  }
}
</style>