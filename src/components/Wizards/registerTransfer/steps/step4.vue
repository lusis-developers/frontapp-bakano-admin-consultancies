<script setup lang="ts">
import type { ManualTransferForm } from '@/types/manualTransfer.interface'

const props = defineProps<{
  form: ManualTransferForm
  isLoading: boolean
  wasConfirmed: boolean
}>()

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'edit'): void
  (e: 'close'): void
}>()
</script>

<template>
  <div class="step step4">
    <h3>Resumen de la Transferencia</h3>

    <ul class="summary-list">
      <li><strong>Cliente:</strong> {{ form.clientName }}</li>
      <li><strong>Correo:</strong> {{ form.email }}</li>
      <li><strong>Teléfono:</strong> {{ form.phone }}</li>
      <li><strong>Negocio:</strong> {{ form.businessName }}</li>
      <li><strong>Banco:</strong> {{ form.bank }}</li>
      <li><strong>País:</strong> {{ form.country }}</li>
      <li><strong>Cédula / ID:</strong> {{ form.clientId }}</li>
      <li><strong>Monto:</strong> ${{ form.amount }}</li>
      <li><strong>Descripción:</strong> {{ form.description }}</li>
    </ul>

    <div v-if="wasConfirmed" class="success-message">
      <p><i class="fas fa-check-circle"></i> ¡La transferencia ha sido registrada exitosamente!</p>
      <button @click="emit('close')" class="confirm-button">Cerrar</button>
    </div>

    <div class="form-actions" v-else>
      <button type="button" class="edit-button" @click="emit('edit')">
        <i class="fas fa-arrow-left"></i> Editar
      </button>
      <button
        type="button"
        class="confirm-button"
        @click="emit('confirm')"
        :disabled="isLoading"
      >
        <i v-if="isLoading" class="fas fa-spinner fa-spin"></i>
        <span v-else>Confirmar Registro</span>
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/index.scss' as *;

.step4 {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  h3 {
    font-size: 1.25rem;
    color: $BAKANO-PURPLE;
  }

  .summary-list {
    list-style: none;
    padding: 0;

    li {
      margin-bottom: 0.5rem;
      font-size: 1rem;
      color: $BAKANO-DARK;

      strong {
        color: $BAKANO-PINK;
      }
    }
  }

  .form-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 1rem;

    button {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      font-size: 1rem;
    }

    .edit-button {
      background-color: transparent;
      border: 2px solid $BAKANO-DARK;
      color: $BAKANO-DARK;

      &:hover {
        background-color: rgba($BAKANO-DARK, 0.05);
      }
    }

    .confirm-button {
      background-color: $BAKANO-PINK;
      color: $white;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;

      &:hover {
        background-color: darken($BAKANO-PINK, 5%);
      }

      &:disabled {
        background-color: rgba($BAKANO-PINK, 0.5);
        cursor: not-allowed;
      }
    }
  }

  .success-message {
    background-color: rgba($BAKANO-GREEN, 0.1);
    border: 1px solid $BAKANO-GREEN;
    border-radius: 8px;
    padding: 1rem;
    text-align: center;
    color: $BAKANO-DARK;
    font-weight: 500;

    i {
      color: $BAKANO-GREEN;
      margin-right: 0.5rem;
    }

    button {
      margin-top: 1rem;
      background-color: $BAKANO-GREEN;
      color: $white;
      border: none;
      padding: 0.5rem 1.25rem;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;

      &:hover {
        background-color: darken($BAKANO-GREEN, 5%);
      }
    }
  }

}
</style>
