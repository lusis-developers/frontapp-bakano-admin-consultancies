<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import clientService from '@/services/clientService'
import type { Client } from '@/types/client.inteface'

const props = defineProps<{ form: any }>()
const clients = ref<Client[]>([])
const selectedClientId = ref('')

watch(selectedClientId, (id) => {
  const selected = clients.value.find(c => c._id === id)
  if (selected) {
    props.form.mongoId = selected._id
    props.form.nombreCliente = selected.name
    props.form.correoCliente = selected.email
    props.form.telefono = selected.phone || ''
    props.form.ci = selected.nationalIdentification
  }
})

onMounted(async () => {
  const response = await clientService.getAllClients()

  if (typeof response === 'object' && response !== null && 'data' in response) {
    clients.value = response.data as Client[]
  } else {
    console.warn('⚠️ Respuesta inesperada al cargar clientes:', response)
    clients.value = []
  }
})
</script>

<template>
  <div class="step-content">
    <div class="form-group">
      <label>Seleccionar Cliente Existente</label>
      <select v-model="selectedClientId">
        <option value="">-- Selecciona un cliente --</option>
        <option v-for="client in clients" :key="client._id" :value="client._id">
          {{ client.name }} - {{ client.email }}
        </option>
      </select>
    </div>

    <div class="form-group">
      <label>Nombre del Cliente</label>
      <input v-model="form.nombreCliente" type="text" placeholder="Ej: Diego Reyes" />
    </div>

    <div class="form-group">
      <label>Correo del Cliente</label>
      <input v-model="form.correoCliente" type="email" placeholder="Ej: diego@email.com" />
    </div>

    <div class="form-group">
      <label>Teléfono</label>
      <input v-model="form.telefono" type="tel" placeholder="0999999999" />
    </div>

    <div class="form-group">
      <label>Cédula o RUC</label>
      <input v-model="form.ci" type="text" placeholder="Ej: 0954227648" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/index.scss' as *;

.step-content {
  animation: fadeIn 0.3s ease;
  padding: 1rem 0;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;

  label {
    margin-bottom: 0.5rem;
    color: $BAKANO-DARK;
    font-weight: 500;
  }

  input {
    padding: 0.75rem;
    border: 2px solid rgba($BAKANO-DARK, 0.1);
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.3s, box-shadow 0.3s;

    &:focus {
      outline: none;
      border-color: $BAKANO-PINK;
      box-shadow: 0 0 0 3px rgba($BAKANO-PINK, 0.1);
    }
  }
}

select {
  padding: 0.75rem;
  font-size: 1rem;
  border: 2px solid rgba($BAKANO-DARK, 0.1);
  border-radius: 8px;
  background-color: $white;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;

  &:focus {
    outline: none;
    border-color: $BAKANO-PINK;
    box-shadow: 0 0 0 3px rgba($BAKANO-PINK, 0.1);
  }
}


@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
