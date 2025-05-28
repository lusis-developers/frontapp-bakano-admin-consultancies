<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import type { ManualTransferForm } from '@/types/manualTransfer.interface'
import type { Client } from '@/types/client.inteface';
import clientService from '@/services/clientService';

const props = defineProps<{ form: ManualTransferForm }>()
const emit = defineEmits<{ (e: 'valid', isValid: boolean): void }>()

const clients = ref<Client[]>([])
const selectedClientId = ref('')

watch(selectedClientId, (id) => {
  const selected = clients.value.find(c => c._id === id)
  if (selected) {
    props.form.mongoId = selected._id
    props.form.clientName = selected.name
    props.form.email = selected.email
    props.form.phone = selected.phone || ''
    props.form.clientId = selected.nationalIdentification
    props.form.country = selected.country || 'ecuador'
  }
})

watch(
  () => [props.form.clientName, props.form.email, props.form.phone, props.form.clientId, props.form.country],
  () => {
    const isValid =
      props.form.clientName.trim() !== '' &&
      props.form.email.trim() !== '' &&
      props.form.phone.trim() !== '' &&
      props.form.clientId.trim() !== '' &&
      props.form.country.trim() !== ''
    emit('valid', isValid)
  },
  { immediate: true }
)


onMounted(async () => {
  const response = await clientService.getAllClients()
  const allClients = typeof response === 'object' && response !== null && 'data' in response
    ? (response.data as Client[])
    : []
  console.log('📦 Clientes:', allClients)
  clients.value = allClients
})
</script>



<template>
  <div class="step step1">
    <h3>Información del Cliente</h3>

    <div class="form-group">
      <label>Buscar Cliente Existente</label>
      <select v-model="selectedClientId">
        <option value="">-- Selecciona un cliente --</option>
        <option v-for="client in clients" :key="client._id" :value="client._id">
          {{ client.name }} - {{ client.email }}
        </option>
      </select>
    </div>

    <div class="form-group">
      <label>Nombre del Cliente</label>
      <input v-model="form.clientName" type="text" placeholder="Ej: Diego Reyes" />
    </div>

    <div class="form-group">
      <label>Correo Electrónico</label>
      <input v-model="form.email" type="email" placeholder="Ej: diego@email.com" />
    </div>

    <div class="form-group">
      <label>Teléfono</label>
      <input v-model="form.phone" type="tel" placeholder="Ej: 0999999999" />
    </div>

    <div class="form-group">
      <label>Cédula o RUC</label>
      <input v-model="form.clientId" type="text" placeholder="Ej: 0954227648" />
    </div>

    <div class="form-group">
      <label>País</label>
      <input v-model="form.country" type="text" placeholder="Ej: Ecuador" />
    </div>
  </div>
</template>


<style scoped lang="scss">
@use '@/styles/index.scss' as *;

.step1 {
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

select {
  padding: 0.6rem;
  border: 1px solid rgba($BAKANO-PURPLE, 0.3);
  border-radius: 8px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: $BAKANO-PINK;
  }
}
</style>
