<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { Client } from '@/types/client.inteface'
import clientService from '@/services/clientService'
import type { ManualPaymentForm } from '@/types/manualTransfer.interface'
import SearchableSelect from '@/components/shared/searchableSelect.vue'

const props = defineProps<{ form: ManualPaymentForm }>()
const emit = defineEmits<{
  (e: 'update:form', form: ManualPaymentForm): void
  (e: 'valid', isValid: boolean): void
}>()
const allClients = ref<Client[]>([])
const isLoading = ref(true)
const selectedClientId = ref<string | null>(null)

const isExistingClient = ref(false)

onMounted(async () => {
  isLoading.value = true
  try {
    const response = (await clientService.getAllClients()) as { data: Client[] }
    allClients.value = Array.isArray(response.data) ? response.data : []
  } catch (error) {
    console.error('Error al cargar la lista de clientes:', error)
    allClients.value = []
  } finally {
    isLoading.value = false
  }
})

const searchClientsOnFrontend = (query: string): Client[] => {
  if (!query) return []
  const lowerCaseQuery = query.toLowerCase().trim()
  return allClients.value.filter(
    (client) =>
      client.name.toLowerCase().includes(lowerCaseQuery) ||
      client.email.toLowerCase().includes(lowerCaseQuery),
  )
}

const handleClientSelected = (client: Client | null) => {
  if (client) {
    const updatedForm: ManualPaymentForm = {
      ...props.form,
      clientName: client.name,
      email: client.email,
      phone: client.phone || '',
      clientId: client.nationalIdentification,
      country: client.country || 'ecuador',
      mongoId: client._id,
    }
    emit('update:form', updatedForm)
  }
}

const resetClientFields = () => {
  const updatedForm = {
    ...props.form,
    mongoId: undefined,
    clientName: '',
    email: '',
    phone: '',
    clientId: '',
  }
  emit('update:form', updatedForm)
}

watch(isExistingClient, (isExisting) => {
  if (!isExisting) {
    resetClientFields()
  }
})

const isFormValid = computed(() => {
  if (isExistingClient.value) {
    return !!props.form.mongoId
  } else {
    const { clientName, email, phone, clientId, country } = props.form
    return (
      clientName?.trim() !== '' &&
      email?.trim() !== '' &&
      phone?.trim() !== '' &&
      clientId?.trim() !== '' &&
      country?.trim() !== ''
    )
  }
})

watch(
  isFormValid,
  (isValid) => {
    emit('valid', isValid)
  },
  { immediate: true, deep: true },
)

const handleInputChange = (field: keyof ManualPaymentForm, value: string) => {
  emit('update:form', { ...props.form, [field]: value })
}
</script>

<template>
  <div class="step step1">
    <h3>Información del Cliente</h3>

    <div class="form-group checkbox-group">
      <input id="is-existing-client" type="checkbox" v-model="isExistingClient" />
      <label for="is-existing-client">Seleccionar un cliente existente</label>
    </div>

    <div v-if="isExistingClient" class="client-search-section">
      <div v-if="isLoading" class="loading-placeholder">Cargando clientes...</div>
      <SearchableSelect
        v-else
        v-model="selectedClientId"
        :search-function="searchClientsOnFrontend"
        label-field="name"
        value-field="_id"
        placeholder="Buscar cliente por nombre o email..."
        @select="handleClientSelected"
      />
    </div>

    <div v-else class="new-client-form">
      <div class="form-group">
        <label>Nombre del Cliente</label>
        <input
          :value="form.clientName"
          @input="handleInputChange('clientName', ($event.target as HTMLInputElement).value)"
          type="text"
          placeholder="Ej: Ana Lema"
        />
      </div>
      <div class="form-group">
        <label>Correo Electrónico</label>
        <input
          :value="form.email"
          @input="handleInputChange('email', ($event.target as HTMLInputElement).value)"
          type="email"
          placeholder="Ej: ana.l@email.com"
        />
      </div>
      <div class="form-group">
        <label>Teléfono</label>
        <input
          :value="form.phone"
          @input="handleInputChange('phone', ($event.target as HTMLInputElement).value)"
          type="tel"
          placeholder="Ej: 0987654321"
        />
      </div>
      <div class="form-group">
        <label>Cédula o RUC</label>
        <input
          :value="form.clientId"
          @input="handleInputChange('clientId', ($event.target as HTMLInputElement).value)"
          type="text"
          placeholder="Ej: 1722334455"
        />
      </div>
      <div class="form-group">
        <label>País</label>
        <input
          :value="form.country"
          @input="handleInputChange('country', ($event.target as HTMLInputElement).value)"
          type="text"
          placeholder="Ej: Ecuador"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/index.scss' as *;

.step1 {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

h3 {
  font-size: 1.25rem;
  color: $BAKANO-PURPLE;
  margin-bottom: 0rem;
}

.form-group {
  display: flex;
  flex-direction: column;

  label {
    font-weight: 600;
    color: $BAKANO-DARK;
    margin-bottom: 0.4rem;
  }

  input[type='text'],
  input[type='email'],
  input[type='tel'] {
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

.checkbox-group {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid rgba($BAKANO-DARK, 0.1);
  padding-bottom: 1rem;

  label {
    margin-bottom: 0; // Reset margin for this specific label
    font-weight: 500;
    cursor: pointer;
  }

  input[type='checkbox'] {
    width: 1.2em;
    height: 1.2em;
    cursor: pointer;
  }
}

.new-client-form,
.client-search-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.loading-placeholder {
  padding: 0.6rem;
  border: 1px solid rgba($BAKANO-PURPLE, 0.3);
  border-radius: 8px;
  background-color: #f7f7f7;
  color: #888;
  font-size: 1rem;
  text-align: center;
}
</style>
