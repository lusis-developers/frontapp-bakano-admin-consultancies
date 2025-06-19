<script setup lang="ts">
import { ref } from 'vue';
import useClientAndBusinessStore from '@/stores/clientAndBusiness';

const props = defineProps<{
  meetingId: string;
}>();

const store = useClientAndBusinessStore();
const isLoading = ref(false);

const handleConfirmation = async () => {
  if (isLoading.value) return;

  isLoading.value = true;
  try {
    await store.confirmPortfolioAccess(props.meetingId);
    // El store se actualiza solo, la UI reaccionará.
  } catch (error) {
    // El store ya maneja el error, pero podríamos mostrar feedback aquí si quisiéramos.
    console.error("Falló la confirmación desde el botón.");
  } finally {
    isLoading.value = false;
  }
};

console.log('carga componente de confirmacion')
</script>

<template>
  <button @click="handleConfirmation" :disabled="isLoading" class="confirm-button">
    <span v-if="isLoading">
      <i class="fas fa-spinner fa-spin"></i> Procesando...
    </span>
    <span v-else>
      <i class="fas fa-check-circle"></i> Confirmar Acceso y Habilitar Siguiente Paso
    </span>
  </button>
</template>

<style lang="scss" scoped>
@use '@/styles/index.scss' as *;

.confirm-button {
  background-color: $BAKANO-GREEN;
  color: $white;
  border: none;
  padding: 0.7rem 1.4rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s ease-in-out;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background-color: darken($BAKANO-GREEN, 10%);
    box-shadow: 0 4px 12px rgba($BAKANO-GREEN, 0.2);
  }

  &:disabled {
    background-color: #9e9e9e;
    cursor: not-allowed;
    box-shadow: none;
  }
}
</style>