<script setup lang="ts">
import { watch } from 'vue'
import type { ManualTransferForm } from '@/types/manualTransfer.interface'

const props = defineProps<{ form: ManualTransferForm }>()
const emit = defineEmits<{ (e: 'valid', isValid: boolean): void }>()

watch(
  () => [props.form.businessName, props.form.bank],
  () => {
    const isValid =
      props.form.businessName.trim() !== '' &&
      props.form.bank.trim() !== ''
    emit('valid', isValid)
  },
  { immediate: true }
)
</script>

<template>
  <div class="step step2">
    <h3>Información del Negocio y Banco</h3>

    <div class="form-group">
      <label>Nombre del Negocio</label>
      <input v-model="form.businessName" type="text" placeholder="Ej: La Pasta Mia" />
    </div>

    <div class="form-group">
      <label>Banco</label>
      <input v-model="form.bank" type="text" placeholder="Ej: Banco Pichincha" />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/index.scss' as *;

.step2 {
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

    input {
      padding: 0.6rem;
      border: 1px solid rgba($BAKANO-PURPLE, 0.3);
      border-radius: 8px;
      font-size: 1rem;
      transition: border 0.2s ease;

      &:focus {
        outline: none;
        border-color: $BAKANO-PINK;
      }
    }
  }
}
</style>
