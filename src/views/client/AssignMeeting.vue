<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { differenceInMinutes, format, formatDistanceToNow, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import useClientAndBusinessStore from '@/stores/clientAndBusiness'
import { useConfirmationDialog } from '@/composables/useConfirmationDialog'
import { useToast } from '@/composables/useToast'
import type { Meeting } from '@/types/meeting.interface'

const store = useClientAndBusinessStore()
const { reveal, selectedValue } = useConfirmationDialog()
const { triggerToast } = useToast()

const meetingBeingAssigned = ref<string | null>(null)
const expandedMeetingId = ref<string | null>(null)


const toggleDetails = (meetingId: string) => {
  expandedMeetingId.value = expandedMeetingId.value === meetingId ? null : meetingId
}

const handleAssign = async (meetingId: string, businessId: string | null = null) => {
  meetingBeingAssigned.value = meetingId
  try {
    const success = await store.assignMeeting(meetingId, businessId)
    if (success) {
      triggerToast('Reunión asignada exitosamente.', 'success')
    } else {
      triggerToast(store.error?.message || 'No se pudo asignar la reunión.', 'error')
    }
  } catch (error) {
    triggerToast('Ocurrió un error inesperado al asignar.', 'error')
    console.error('Error en handleAssign:', error)
  } finally {
    meetingBeingAssigned.value = null
  }
}

const requestAssignConfirmation = async (meeting: Meeting) => {
  if (!store.client) return

  const clientBusinesses = store.businesses || []
  let businessIdToAssign: string | null = null
  const dialogOptions: Parameters<typeof reveal>[0] = {
    title: 'Confirmar Asignación',
    message: `Estás a punto de asignar la reunión de tipo <strong>${meeting.meetingType}</strong> al cliente <strong>${store.client.name}</strong>.`,
  }

  if (clientBusinesses.length === 1) {
    businessIdToAssign = clientBusinesses[0]._id
    dialogOptions.message += `<br><br>Se vinculará automáticamente al negocio: <strong>${clientBusinesses[0].name}</strong>.`
  }

  else if (clientBusinesses.length > 1) {
    dialogOptions.selectionConfig = {
      label: 'Este cliente tiene varios negocios. Por favor, selecciona a cuál corresponde esta reunión:',
      items: clientBusinesses,
      displayField: 'name',
      valueField: '_id',
    }
  }

  try {
    const confirmed = await reveal(dialogOptions)

    if (confirmed) {
      const finalBusinessId = selectedValue.value || businessIdToAssign
      await handleAssign(meeting._id, finalBusinessId)
    }
  } catch (error) {
    triggerToast('La asignación ha sido cancelada.', 'info')
  }
}

const formatDate = (date?: string | Date) =>
  date ? format(new Date(date), 'dd MMMM, yyyy HH:mm', { locale: es }) : 'N/A'

const formatRelativeTime = (date?: string | Date) =>
  date ? formatDistanceToNow(new Date(date), { addSuffix: true, locale: es }) : 'N/A'

const calculateDuration = (start?: string, end?: string) => {
  if (!start || !end) return 'N/A'
  const duration = differenceInMinutes(parseISO(end), parseISO(start))
  if (duration < 60) return `${duration} min`
  const hours = Math.floor(duration / 60)
  const minutes = duration % 60
  return `${hours}h ${minutes > 0 ? `${minutes}min` : ''}`
}

// --- CICLO DE VIDA ---
onMounted(() => {
  store.fetchUnassignedMeetings()
})
</script>

<template>
  <section class="card">
    <div class="card-header">
      <i class="fas fa-link header-icon"></i>
      <h3>Asignar Reunión Existente</h3>
    </div>

    <div v-if="store.isAssigningMeeting && store.unassignedMeetings.length === 0" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <span>Cargando reuniones...</span>
    </div>
    
    <div v-else-if="store.unassignedMeetings.length > 0">
      <ul class="assign-meeting-list">
        <li
          v-for="meeting in store.unassignedMeetings"
          :key="meeting._id"
          class="assign-meeting-item"
          :class="{ 'is-expanded': expandedMeetingId === meeting._id }"
        >
          <div class="main-row" @click="toggleDetails(meeting._id)">
            <div class="meeting-info">
              <span class="meeting-type">{{ meeting.meetingType }}</span>
              <span class="meeting-time">{{ formatDate(meeting.scheduledTime) }}</span>
            </div>
            <div class="meeting-actions">
              <button
                @click.stop="requestAssignConfirmation(meeting)"
                class="btn-assign"
                :disabled="!!meetingBeingAssigned"
              >
                <i v-if="meetingBeingAssigned === meeting._id" class="fas fa-spinner fa-spin"></i>
                <span v-else>Asignar</span>
              </button>
              <i class="fas fa-chevron-down expand-icon"></i>
            </div>
          </div>
          <Transition name="slide-fade">
            <div v-if="expandedMeetingId === meeting._id" class="details-panel">
              <div class="detail-item">
                <span class="detail-label">Agente:</span>
                <span class="detail-value">{{ meeting.assignedTo }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Duración:</span>
                <span class="detail-value">{{ calculateDuration(meeting.scheduledTime, meeting.endTime) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Fuente:</span>
                <span class="detail-value">{{ meeting.source }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Creada:</span>
                <span class="detail-value">{{ formatRelativeTime(meeting.createdAt) }}</span>
              </div>
              <div class="detail-item full-width">
                <span class="detail-label">Asistente:</span>
                <span class="detail-value">{{ meeting.attendeeEmail || 'No registrado' }}</span>
              </div>
            </div>
          </Transition>
        </li>
      </ul>
    </div>
    <div v-else class="empty-state">
      <p>No hay reuniones pendientes por asignar.</p>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use '@/styles/index.scss' as *;

.card-header .header-icon {
  color: $BAKANO-GREEN;
}

.loading-state,
.empty-state {
  font-family: $font-secondary;
  text-align: center;
  color: rgba($BAKANO-DARK, 0.6);
  padding: 1.5rem 1rem;
  font-style: italic;
  background-color: lighten($BAKANO-LIGHT, 3%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.assign-meeting-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.assign-meeting-item {
  border-bottom: 1px solid $BAKANO-LIGHT;
  transition: background-color 0.2s ease;
  border-radius: 8px;

  &:last-child {
    border-bottom: none;
  }

  &.is-expanded {
    background-color: lighten($BAKANO-LIGHT, 3%);
    padding: 0 0.5rem 0.5rem 0.5rem;
  }
}

.main-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0.25rem;
  cursor: pointer;
  gap: 1rem;
}

.meeting-info {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.meeting-type {
  font-family: $font-principal;
  font-weight: 600;
  color: $BAKANO-DARK;
  font-size: 0.9rem;
  text-transform: capitalize;
}

.meeting-time {
  font-family: $font-secondary;
  font-size: 0.8rem;
  color: rgba($BAKANO-DARK, 0.7);
}

.meeting-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.btn-assign {
  font-family: $font-principal;
  font-weight: 600;
  background-color: $overlay-purple;
  color: $BAKANO-PURPLE;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 90px;
  text-align: center;

  &:hover:not(:disabled) {
    background-color: $BAKANO-PURPLE;
    color: $white;
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}

.expand-icon {
  color: rgba($BAKANO-DARK, 0.4);
  transition: transform 0.3s ease;

  .is-expanded & {
    transform: rotate(180deg);
  }
}

.details-panel {
  padding: 1rem 0.5rem 0.5rem 0.5rem;
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
  border-top: 1px dashed $BAKANO-LIGHT;

  @media (min-width: 480px) {
    grid-template-columns: 1fr 1fr;
  }

  .full-width {
    grid-column: 1 / -1;
  }
}

.detail-item {
  display: flex;
  flex-direction: column;
}

.detail-label {
  font-family: $font-secondary;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  color: rgba($BAKANO-DARK, 0.5);
  margin-bottom: 0.1rem;
}

.detail-value {
  font-family: $font-secondary;
  font-size: 0.9rem;
  color: $BAKANO-DARK;
}

.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}
</style>