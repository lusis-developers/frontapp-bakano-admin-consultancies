<script setup lang="ts">
import type { ManualTransferForm } from '@/types/manualTransfer.interface'

defineProps<{
  form: ManualTransferForm
}>()
</script>

<template>
  <div class="step step3">
    <h3>Detalles del Pago</h3>

    <div class="form-group">
      <label>Monto Transferido</label>
      <input v-model="form.amount" type="number" placeholder="Ej: 2500.00" min="0" step="0.01" />
    </div>

    <div class="form-group">
      <label>Descripción</label>
      <textarea
        v-model="form.description"
        placeholder="Ej: Servicio de consultoría empresarial"
        rows="3"
      ></textarea>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/index.scss' as *;

.step3 {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  h3 {
    font-size: 1.25rem;
    color: $BAKANO-PURPLE;
    margin-bottom: 1rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;

    label {
      font-weight: 600;
      color: $BAKANO-DARK;
      margin-bottom: 0.4rem;
    }

    input,
    textarea {
      padding: 0.6rem;
      border: 1px solid rgba($BAKANO-PURPLE, 0.3);
      border-radius: 8px;
      font-size: 1rem;
      resize: vertical;

      &:focus {
        outline: none;
        border-color: $BAKANO-PINK;
      }
    }
  }
}
</style>
