<script setup lang="ts">
const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()
</script>

<template>
  <div v-if="open" class="overlay">
    <div class="dialog">
      <h3>¿Estás seguro de cerrar?</h3>
      <p>Se perderán todos los datos ingresados.</p>
      <div class="actions">
        <button class="cancel" @click="emit('cancel')">Cancelar</button>
        <button class="confirm" @click="emit('confirm')">Sí, cerrar</button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/index.scss' as *;

.overlay {
  position: fixed;
  inset: 0;
  background-color: rgba($BAKANO-DARK, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
}

.dialog {
  background-color: $white;
  padding: 2rem;
  border-radius: 16px;
  max-width: 90%;
  width: 400px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  text-align: center;
  font-family: $font-principal;

  h3 {
    margin-bottom: 0.5rem;
    font-size: 1.5rem;
    color: $BAKANO-DARK;
    font-weight: 600;
  }

  p {
    margin-bottom: 1.5rem;
    color: rgba($BAKANO-DARK, 0.7);
    font-size: 1rem;
    font-weight: 400;
  }

  .actions {
    display: flex;
    justify-content: space-around;
    gap: 1rem;

    button {
      padding: 0.75rem 1.5rem;
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      font-family: $font-principal;
      transition: all 0.3s ease;
      border: none;
    }

    .cancel {
      background-color: transparent;
      border: 2px solid rgba($BAKANO-DARK, 0.2);
      color: $BAKANO-DARK;

      &:hover {
        background-color: rgba($BAKANO-DARK, 0.05);
      }
    }

    .confirm {
      background-color: $BAKANO-PINK;
      color: $white;

      &:hover {
        background-color: darken($BAKANO-PINK, 5%);
      }
    }
  }
}
</style>
