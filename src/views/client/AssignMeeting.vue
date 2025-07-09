<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { format } from 'date-fns';
import useClientAndBusinessStore from '@/stores/clientAndBusiness';
import { useConfirmationDialog } from '@/composables/useConfirmationDialog';
import type { Meeting } from '@/types/meeting.interface';


const { reveal } = useConfirmationDialog();

const store = useClientAndBusinessStore();
const meetingBeingAssigned = ref<string | null>(null);

onMounted(() => {
  store.fetchUnassignedMeetings();
});

const handleAssign = async (meetingId: string) => {
  meetingBeingAssigned.value = meetingId;
  const success = await store.assignMeeting(meetingId);
  if (!success) {
    console.error('Error al asignar la reunión');
  }
  meetingBeingAssigned.value = null;
};

const requestAssignConfirmation = async (meeting: Meeting) => {
  try {
    // El await aquí esperará a que el usuario presione "Confirmar"
    const confirmed = await reveal({
      title: 'Confirmar Asignación',
      message: `Estás a punto de asignar la reunión de tipo "${meeting.meetingType}" al cliente "${store.client?.name}". Esta reunión se considera sin seguimiento y la acción no se puede deshacer.`,
      confirmationText: 'ASIGNAR'
    });

    // Este bloque solo se ejecuta si la promesa se RESUELVE (es decir, el usuario confirma)
    if (confirmed) {
      await handleAssign(meeting._id);
    }
  } catch (error) {
    // Este bloque se ejecuta si la promesa se RECHAZA (es decir, el usuario cancela)
    console.log('Asignación cancelada por el usuario.');
    // No necesitamos hacer nada más, el diálogo ya se cerró.
  }
};

const formatDate = (date?: string | Date) =>
  date ? format(new Date(date), 'dd MMMM, yyyy HH:mm') : 'N/A';
</script>

<template>
  <section class="card">
    <div class="card-header">
      <i class="fas fa-link header-icon"></i>
      <h3>Asignar Reunión Existente</h3>
    </div>
    <div v-if="store.unassignedMeetings.length > 0">
      <ul class="assign-meeting-list">
        <li v-for="meeting in store.unassignedMeetings" :key="meeting._id" class="assign-meeting-item">
          <div class="meeting-info">
            <span class="meeting-type">{{ meeting.meetingType }}</span>
            <span class="meeting-time">{{ formatDate(meeting.scheduledTime) }}</span>
          </div>
          <button @click="requestAssignConfirmation(meeting)" class="btn-assign" :disabled="!!meetingBeingAssigned">
            <i v-if="meetingBeingAssigned === meeting._id" class="fas fa-spinner fa-spin"></i>
            <span v-else>Asignar</span>
          </button>
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

.assign-meeting-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
}

.assign-meeting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0.25rem;
  border-bottom: 1px solid $BAKANO-LIGHT;
  gap: 1rem;

  &:last-child {
    border-bottom: none;
  }
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

.empty-state {
  font-family: $font-secondary;
  text-align: center;
  color: rgba($BAKANO-DARK, 0.6);
  padding: 1.5rem 1rem;
  font-style: italic;
  background-color: lighten($BAKANO-LIGHT, 3%);
  border-radius: 8px;
}
</style>