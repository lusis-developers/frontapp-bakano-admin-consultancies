<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { PayMethod } from '@/enums/payMethod.enum'
import useClientAndBusinessStore from '@/stores/clientAndBusiness'
import type { ManualPaymentForm } from '@/types/manualTransfer.interface'
import { BusinessTypeEnum } from '@/enums/businessType.enum'
import SearchableSelect from '@/components/shared/searchableSelect.vue'
import { businessTypeTranslations } from '@/i18n/es'

// 💡 1. Importamos nuestro nuevo diccionario de traducciones.

const props = defineProps<{ form: ManualPaymentForm }>()
const emit = defineEmits<{ (e: 'valid', isValid: boolean): void }>()

const selectedBusinessId = ref(props.form.businessName || '')
const clientAndBusinessStore = useClientAndBusinessStore()

// 💡 2. Modificamos la propiedad computada para usar las traducciones.
const businessTypesForSelect = computed(() =>
  // Iteramos sobre las claves del enum para mantener el orden y la integridad.
  Object.values(BusinessTypeEnum).map((enumKey) => ({
    // `name` es el valor en español para la UI.
    name: businessTypeTranslations[enumKey],
    // `_id` es el valor en inglés del enum, que se guardará en la base de datos.
    _id: enumKey,
  }))
)

// El resto del script no necesita cambios...
watch(
  () => props.form.mongoId,
  async (newMongoId) => {
    if (newMongoId) {
      selectedBusinessId.value = ''
      props.form.businessName = ''
      props.form.businessType = null
      await clientAndBusinessStore.fetchClientWithDetails(newMongoId)
    }
  },
  { immediate: true }
)

const handleBusinessSelected = (business: any | null) => {
  if (business) {
    props.form.businessName = business.name
    props.form.businessType = (business.businessType as BusinessTypeEnum) || null
    selectedBusinessId.value = business._id
  }
}

watch(
  () => props.form.paymentMethod,
  (method) => {
    if (method === PayMethod.DATIL) {
      props.form.bank = PayMethod.DATIL
    }
  },
  { immediate: true }
)

watch(
  () => [props.form.businessName, props.form.bank, props.form.businessType],
  () => {
    const isValid =
      props.form.businessName.trim() !== '' &&
      props.form.bank.trim() !== '' &&
      props.form.businessType !== null
    emit('valid', isValid)
  },
  { immediate: true, deep: true }
)
</script>

<template>
  <div class="step step2">
    <h3>Información del Negocio y Banco</h3>

    <div class="form-group">
      <label>Seleccionar Negocio Existente</label>
      <SearchableSelect
        :model-value="selectedBusinessId"
        :items="clientAndBusinessStore.businesses"
        label-field="name"
        value-field="_id"
        placeholder="Buscar negocio existente..."
        :disabled="clientAndBusinessStore.businesses.length === 0"
        @select="handleBusinessSelected"
        @update:model-value="selectedBusinessId = $event as string"
      />
      <small v-if="clientAndBusinessStore.businesses.length === 0"
        >Este cliente no tiene negocios registrados.</small
      >
    </div>

    <div class="form-grid">
      <div class="form-group">
        <label>Nombre del Negocio</label>
        <p>Puedes registrar uno nuevo o modificar el seleccionado.</p>
        <input v-model="form.businessName" type="text" placeholder="Ej: El Asado del Die" />
      </div>

      <div class="form-group">
        <label>Tipo de Negocio</label>
        <p>Clasifica el negocio para un mejor análisis.</p>
        <SearchableSelect
          v-model="form.businessType"
          :items="businessTypesForSelect"
          label-field="name"
          value-field="_id"
          placeholder="Buscar tipo de negocio..."
        />
      </div>

      <div class="form-group">
        <label>Compromiso de Valor</label>
        <p>Describe brevemente la propuesta que le prometimos al cliente.</p>
        <textarea
          v-model="form.valueProposition"
          placeholder="Ej: Facturar 1 millón de dólares"
          rows="3"
        ></textarea>
      </div>
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

small {
  margin-top: 0.25rem;
  font-size: 0.8rem;
  color: rgba($BAKANO-DARK, 0.6);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
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
    margin-bottom: 0;
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

    p {
      font-size: 0.85rem;
      margin: 0;
      color: rgba($BAKANO-DARK, 0.7);
    }

    input,
    select,
    textarea {
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

    textarea {
      resize: vertical;
      min-height: 80px;
    }
  }
}
</style>