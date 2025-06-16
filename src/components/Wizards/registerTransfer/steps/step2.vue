<script setup lang="ts">
import { ref, watch } from 'vue'
import { PayMethod } from '@/enums/payMethod.enum'
import useClientAndBusinessStore from '@/stores/clientAndBusiness'
import type { ManualPaymentForm } from '@/types/manualTransfer.interface';

const props = defineProps<{ form: ManualPaymentForm }>()
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

watch(selectedBusinessId, (id) => {
  const selected = clientAndBusinessStore.businesses.find(b => b._id === id)
  if (selected) {
    props.form.businessName = selected.name
  }
})

watch(
  () => props.form.paymentMethod,
  (method) => {
    if (method === PayMethod.DATIL) {
      props.form.bank = PayMethod.DATIL
    }
  },
  { immediate: true }
)

// 4. Este watch final valida si el paso es correcto para poder avanzar
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
      <select v-model="selectedBusinessId" :disabled="clientAndBusinessStore.businesses.length === 0">
        <option value="">-- Selecciona un negocio existente --</option>
        <option v-for="biz in clientAndBusinessStore.businesses" :key="biz._id" :value="biz._id">
          {{ biz.name }}
        </option>
      </select>
       <small v-if="clientAndBusinessStore.businesses.length === 0">Este cliente no tiene negocios registrados.</small>
    </div>

    <div class="form-group">
      <label>Nombre del Negocio</label>
      <p>Puedes registrar uno nuevo o modificar el seleccionado.</p>
      <input v-model="form.businessName" type="text" placeholder="Ej: El Asado del Die" />
    </div>

    <div class="form-group">
      <label>Banco</label>
      <input
        v-model="form.bank"
        type="text"
        placeholder="Ej: Banco Pichincha"
        :disabled="form.paymentMethod === PayMethod.DATIL"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/index.scss' as *;

// ... Tu CSS para step2.vue va aquí ...
// He añadido un estilo para el texto de ayuda 'small'
small {
  margin-top: 0.25rem;
  font-size: 0.8rem;
  color: rgba($BAKANO-DARK, 0.6);
}

input:disabled {
  background-color: rgba($BAKANO-DARK, 0.05);
  color: rgba($BAKANO-DARK, 0.5);
  cursor: not-allowed;
  border-style: dashed;
}

.step2 {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  h3 {
    font-size: 1.4rem;
    color: $BAKANO-PURPLE;
    margin-bottom: 1rem;
    font-family: $font-principal;
    font-weight: 600
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: .5rem;

    label {
      font-family: $font-secondary;
      font-size: .95rem;
      font-weight: 600;
      color: $BAKANO-DARK
    }

    p {
      font-size: .85rem;
      margin: 0;
      color: rgba($BAKANO-DARK, .7)
    }

    input,
    select {
      font-family: $font-secondary;
      padding: .75rem 1rem;
      font-size: 1rem;
      background-color: $white;
      border: 1.5px solid rgba($BAKANO-DARK, .1);
      border-radius: 10px;
      transition: border-color .2s ease, box-shadow .2s ease;
      box-shadow: 0 2px 4px rgba(0, 0, 0, .04);

      &:focus {
        outline: 0;
        border-color: $BAKANO-PINK;
        box-shadow: 0 0 0 3px rgba($BAKANO-PINK, .15);
        background-color: #fff
      }
    }

    select {
      appearance: none;
      background-image: linear-gradient(45deg, transparent 50%, $BAKANO-PINK 50%), linear-gradient(135deg, $BAKANO-PINK 50%, transparent 50%);
      background-position: calc(100% - 1rem) center, calc(100% - .75rem) center;
      background-size: 8px 8px, 8px 8px;
      background-repeat: no-repeat
    }
  }
}
</style>