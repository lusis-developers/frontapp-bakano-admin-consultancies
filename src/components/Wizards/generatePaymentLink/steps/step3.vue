<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import useClientAndBusinessStore from '@/stores/clientAndBusiness'

const props = defineProps<{ form: any }>()
const clientBusinessStore = useClientAndBusinessStore()
const selectedBusinessId = ref('')

watch(
  () => props.form.mongoId,
  async (id) => {
    if (id && clientBusinessStore.businesses.length === 0) {
      console.log('🟣 Buscando negocios del cliente:', id)
      await clientBusinessStore.fetchClientWithDetails(id)
    }
  },
  { immediate: true }
)

watch(selectedBusinessId, (id) => {
  const selected = clientBusinessStore.businesses.find(b => b._id === id)
  if (selected) {
    props.form.nombreNegocio = selected.name
    props.form.prefijo = selected.prefix || '593'
  }
})

const businesses = computed(() => clientBusinessStore.businesses || [])
</script>


<template>
  <div class="step-content">
    <div class="form-group">
      <label for="negocioSelect">Seleccionar Negocio Existente</label>
      <select v-model="selectedBusinessId" id="negocioSelect">
        <option value="">-- Selecciona un negocio --</option>
        <option v-for="biz in businesses" :key="biz._id" :value="biz._id">
          {{ biz.name }}
        </option>
      </select>
    </div>
    <div class="form-group">
      <label for="nombreNegocio">Nombre del Negocio (puedes editarlo o escribir uno nuevo)</label>
      <input type="text" id="nombreNegocio" v-model="form.nombreNegocio" required />
    </div>

    <div class="form-group" id="prefijo-group">
      <label for="prefijo">Prefijo</label>
      <input type="text" id="prefijo" v-model="form.prefijo" required />
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
  margin-bottom: 1rem;

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

#prefijo-group input {
  max-width: 120px;
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
