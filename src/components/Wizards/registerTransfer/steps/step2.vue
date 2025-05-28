<script setup lang="ts">
import { ref, watch } from 'vue'
import type { ManualTransferForm } from '@/types/manualTransfer.interface'
import useClientAndBusinessStore from '@/stores/clientAndBusiness'


const props = defineProps<{ form: ManualTransferForm }>()
const emit = defineEmits<{ (e: 'valid', isValid: boolean): void }>()
const selectedBusinessId = ref('')

const clientAndBusinessStore = useClientAndBusinessStore()

watch(
  () => props.form.mongoId,
  async (newMongoId) => {
    if (newMongoId) {
      await clientAndBusinessStore.fetchClientWithDetails(newMongoId)
    }
  },
  { immediate: true }
)

// Cuando seleccionan un negocio, actualiza el formulario
watch(selectedBusinessId, (id) => {
  const selected = clientAndBusinessStore.businesses.find(b => b._id === id)
  if (selected) {
    props.form.businessName = selected.name
  }
})

// Valida el paso
watch(
  () => [props.form.businessName, props.form.bank],
  () => {
    const isValid = props.form.businessName.trim() !== '' && props.form.bank.trim() !== ''
    emit('valid', isValid)
  },
  { immediate: true }
)
</script>

<template>
  <div class="step step2">
    <h3>Información del Negocio y Banco</h3>

    <div class="form-group">
      <label>Seleccionar Negocio Existente</label>
      <select v-model="selectedBusinessId">
        <option value="">-- Selecciona un negocio --</option>
        <option v-for="biz in clientAndBusinessStore.businesses" :key="biz._id" :value="biz._id">
          {{ biz.name }}
        </option>
      </select>
    </div>

    <div class="form-group">
      <label>Nombre del Negocio (puedes modificarlo)</label>
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
  gap: 1.5rem;

  h3 {
    font-size: 1.4rem;
    color: $BAKANO-PURPLE;
    margin-bottom: 1rem;
    font-family: $font-principal;
    font-weight: 600;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    label {
      font-family: $font-secondary;
      font-size: 0.95rem;
      font-weight: 600;
      color: $BAKANO-DARK;
    }

    input,
    select {
      font-family: $font-secondary;
      padding: 0.75rem 1rem;
      font-size: 1rem;
      background-color: $white;
      border: 1.5px solid rgba($BAKANO-DARK, 0.1);
      border-radius: 10px;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);

      &:focus {
        outline: none;
        border-color: $BAKANO-PINK;
        box-shadow: 0 0 0 3px rgba($BAKANO-PINK, 0.15);
        background-color: #fff;
      }
    }

    select {
      appearance: none;
      background-image: linear-gradient(45deg, transparent 50%, $BAKANO-PINK 50%),
        linear-gradient(135deg, $BAKANO-PINK 50%, transparent 50%);
      background-position: calc(100% - 1rem) center, calc(100% - 0.75rem) center;
      background-size: 8px 8px, 8px 8px;
      background-repeat: no-repeat;
    }
  }
}
</style>
