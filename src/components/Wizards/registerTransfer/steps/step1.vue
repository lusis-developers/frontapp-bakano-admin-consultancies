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

const handleClientSelected = (selectedItem: Client | null) => {
  if (selectedItem) {
    emit('update:form', {
      ...props.form,
      clientName: selectedItem.name,
      email: selectedItem.email,
      phone: selectedItem.phone || '',
      clientId: selectedItem.nationalIdentification,
      country: selectedItem.country || 'ecuador',
      mongoId: selectedItem._id,
    })
  }
}

const resetClientFields = () => {
  emit('update:form', {
    ...props.form,
    mongoId: null, // Reseteamos a null, no a undefined
    clientName: '',
    email: '',
    phone: '',
    clientId: '',
  })
}

// El resto del script no necesita más cambios...
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
        :model-value="form.mongoId!"
        :items="allClients"
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
    font-family: $font-secondary;
    padding: 0.75rem 1rem;
    font-size: 1rem;
    background-color: $white;
    border: 1.5px solid rgba($BAKANO-DARK, 0.1);
    border-radius: 10px;
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);

    &:focus {
      outline: 0;
      border-color: $BAKANO-PINK;
      box-shadow: 0 0 0 3px rgba($BAKANO-PINK, 0.15);
      background-color: #fff;
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
    margin-bottom: 0;
    font-weight: 500;
    cursor: pointer;
  }

  input[type='checkbox'] {
    width: 1.2em;
    height: 1.2em;
    cursor: pointer;
    accent-color: $BAKANO-PINK;
  }
}

.new-client-form,
.client-search-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.loading-placeholder {
  padding: 0.75rem 1rem;
  border: 1.5px solid rgba($BAKANO-DARK, 0.1);
  border-radius: 10px;
  background-color: #f9f9f9;
  color: #888;
  font-size: 1rem;
  text-align: center;
}
</style>