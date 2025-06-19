<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { format } from 'date-fns'
import useClientAndBusinessStore from '@/stores/clientAndBusiness'
import { MeetingStatus, MeetingType } from '@/enums/meetingStatus.enum'
import ConfirmStrategyMeet from '@/components/actions/buttons/confirmStrategyMeet.vue'

const route = useRoute()
const router = useRouter()
const clientId = route.params.clientId as string

const store = useClientAndBusinessStore()

const copiedField = ref<string | null>(null)

// Propiedad computada que busca la reunión específica que necesita la acción de Denisse.
const portfolioAccessMeeting = computed(() => {
  if (
    store.meetingStatus?.hasScheduledMeeting &&
    store.meetingStatus.meeting?.meetingType === MeetingType.PORTFOLIO_ACCESS &&
    store.meetingStatus.meeting?.status === MeetingStatus.SCHEDULED
  ) {
    return store.meetingStatus.meeting;
  }
  return null;
});

// onMounted llama a las dos acciones necesarias en paralelo para inicializar la vista.
onMounted(async () => {
  await Promise.all([
    store.fetchClientWithDetails(clientId),
    store.fetchMeetingStatus(clientId)
  ]);
})

const formatDate = (date?: string | Date) =>
  date ? format(new Date(date), 'dd MMMM yyyy, HH:mm') : 'No disponible'

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

const goToAllBusinesses = () => {
  router.push({ name: 'businesses', params: { clientId } })
}
</script>

<template>
  <div class="client-view">
    <h1 class="page-title">Detalles del Cliente</h1>

    <div v-if="store.isLoading" class="loading">
      <i class="fas fa-spinner fa-spin"></i> Cargando...
    </div>

    <div v-else-if="store.error" class="error">
      <p>Error: {{ store.error.message || 'Ocurrió un error inesperado.' }}</p>
    </div>

    <div v-else-if="store.client" class="client-details-grid">
      
      <section class="card">
        <h2>{{ store.client.name }}</h2>
        <p>
          <strong>Correo:</strong>
          <span class="copyable-text" @click="copyToClipboard(store.client.email, 'email')">
            <span v-if="copiedField === 'email'" class="copy-feedback">¡Correo copiado!</span>
            <span v-else>
              {{ store.client.email }}
              <i class="fas fa-copy copy-icon"></i>
            </span>
          </span>
        </p>
        <p>
          <strong>Teléfono:</strong>
          <span class="copyable-text" @click="copyToClipboard(store.client.phone, 'phone')">
            <span v-if="copiedField === 'phone'" class="copy-feedback">¡Teléfono copiado!</span>
            <span v-else>
              {{ store.client.phone }}
              <i class="fas fa-copy copy-icon"></i>
            </span>
          </span>
        </p>
        <p><strong>Ubicación:</strong> {{ store.client.city }}, {{ store.client.country }}</p>
        <p><strong>Último Pago:</strong> {{ formatDate(store.client.paymentInfo?.lastPaymentDate) }}</p>
        <p><strong>Método de Pago:</strong> {{ store.client.paymentInfo?.preferredMethod }}</p>
        <p><strong>Banco:</strong> {{ store.client.paymentInfo?.bank }}</p>
      </section>

      <section class="card onboarding-status-card">
        <h3>Estado de Onboarding</h3>
        
        <div v-if="portfolioAccessMeeting" class="status-block action-required">
          <div class="status-icon">⚠️</div>
          <div class="status-text">
            <h4>Acción Requerida</h4>
            <p>El cliente tiene una reunión de acceso agendada. Confirma que se ha verificado el acceso para habilitar el siguiente paso.</p>
          </div>
          <ConfirmStrategyMeet :meeting-id="portfolioAccessMeeting.id" />
        </div>

        <div v-else-if="store.client.meetings?.some(m => m.meetingType === 'data-strategy' && m.status === 'pending-schedule')" class="status-block waiting-client">
          <div class="status-icon">✅</div>
           <div class="status-text">
            <h4>Acceso Verificado</h4>
            <p>Se ha habilitado la reunión de estrategia. Esperando que el cliente agende la cita con Luis Reyes.</p>
          </div>
        </div>

        <div v-else-if="store.client.meetings?.some(m => m.meetingType === 'data-strategy' && m.status === 'scheduled')" class="status-block next-meeting-scheduled">
           <div class="status-icon">🗓️</div>
           <div class="status-text">
            <h4>¡Siguiente Reunión Agendada!</h4>
            <p>El cliente ya tiene agendada su reunión de estrategia.</p>
          </div>
        </div>

        <div v-else class="status-block all-good">
           <div class="status-icon">👍</div>
           <div class="status-text">
            <h4>Proceso al día</h4>
            <p>No hay acciones de onboarding pendientes en este momento.</p>
          </div>
        </div>
      </section>

      <section v-if="store.businesses?.length" class="card">
        <h3>Último Negocio Registrado</h3>
        <div class="business-summary">
          <h4>{{ store.businesses.at(-1)?.name }}</h4>
          <p><strong>RUC:</strong> {{ store.businesses.at(-1)?.ruc }}</p>
          <p><strong>Teléfono:</strong> {{ store.businesses.at(-1)?.phone }}</p>
          <p><strong>Dirección:</strong> {{ store.businesses.at(-1)?.address }}</p>
          <button @click="goToAllBusinesses" class="view-all-button">Ver todos los negocios</button>
        </div>
      </section>

      <section class="card">
         <h3>Historial de Reuniones</h3>
         <ul v-if="store.client.meetings && store.client.meetings.length > 0" class="meeting-list">
            <li v-for="meeting in store.client.meetings" :key="meeting.id">
              <span class="meeting-type-text">{{ meeting.meetingType }} con {{ meeting.assignedTo }}</span>
              <span :class="`status-${meeting.status}`">{{ meeting.status }}</span>
            </li>
         </ul>
         <p v-else>No hay reuniones registradas.</p>
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
  max-width: 1200px;
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
  font-size: 1.1rem;
  padding: 3rem;
  color: $BAKANO-PINK;
}

.client-details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  align-items: start;
}

.card {
  background: $white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba($BAKANO-DARK, 0.05);

  h2,
  h3 {
    margin-top: 0;
    margin-bottom: 1rem;
    color: $BAKANO-PURPLE;
  }

  p,
  li {
    margin: 0.5rem 0;
    color: $BAKANO-DARK;
    line-height: 1.6;
  }

  ul {
    list-style: none;
    padding: 0;
  }
}

.copyable-text {
  display: inline-flex;
  align-items: center;
  position: relative;
  cursor: pointer;
  padding: 0.2rem 0.5rem;
  margin-left: 0.5rem;
  border-radius: 6px;
  transition: all 0.25s ease-out;

  .copy-icon {
    margin-left: 0.5rem;
    color: rgba($BAKANO-PURPLE, 0.5);
    opacity: 0;
    transition: opacity 0.2s ease-out;
    font-size: 0.85em;
  }

  &:hover {
    background-color: rgba($BAKANO-PINK, 0.08);

    .copy-icon {
      opacity: 1;
    }
  }
}

.copy-feedback {
  color: $BAKANO-PINK;
  font-weight: 600;
  font-size: 0.9em;
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

.meeting-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 0.2rem;
  border-bottom: 1px solid $BAKANO-LIGHT;
  font-size: 0.9rem;

  &:last-child {
    border-bottom: none;
  }
}

.meeting-type-text {
  text-transform: capitalize;
}

.status-scheduled,
.status-completed,
.status-pending-schedule {
  font-weight: 600;
  text-transform: capitalize;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  font-size: 0.8rem;
}

.status-scheduled {
  color: #8a6d3b;
  background-color: #fcf8e3;
}

.status-completed {
  color: $BAKANO-GREEN;
  background-color: rgba($BAKANO-GREEN, 0.1);
}

.status-pending-schedule {
  color: $BAKANO-PURPLE;
  background-color: rgba($BAKANO-PURPLE, 0.1);
}

// Estilos para la nueva tarjeta de estado
.onboarding-status-card {
  h3 {
    margin-bottom: 1.5rem;
  }
}

.status-block {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
  border-radius: 8px;
  border: 1px solid transparent;
}

.status-icon {
  font-size: 1.5rem; // Tamaño reducido para un look más sutil
  line-height: 1.5;
  margin-top: 0.1rem;
}

.status-text {
  flex: 1;

  h4 {
    margin: 0 0 0.25rem 0;
    color: $BAKANO-DARK;
    font-size: 1rem;
  }

  p {
    margin: 0;
    font-size: 0.9rem;
    color: #555;
    line-height: 1.5;
  }
}

.action-required {
  border-color: rgba($BAKANO-PINK, 0.3);
  background-color: rgba($BAKANO-PINK, 0.05);
}

.waiting-client {
  background-color: rgba($BAKANO-PURPLE, 0.07);
}

.next-meeting-scheduled,
.all-good {
  background-color: rgba($BAKANO-GREEN, 0.07);
}
</style>