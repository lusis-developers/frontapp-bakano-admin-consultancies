<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  form: any
}>()

const montoInput = ref('0.00')

// Formateo en estilo bancario: 0.00 → $0.00
const formatCurrency = (value: string): string => {
  // Solo dígitos
  const cleaned = value.replace(/\D/g, '')
  const number = parseFloat(cleaned) / 100
  return number.toFixed(2)
}

// Evento cuando se escribe
const onMontoInput = (event: Event) => {
  const input = (event.target as HTMLInputElement).value
  montoInput.value = formatCurrency(input)
  props.form.monto = parseFloat(montoInput.value)
}

// Inicializar valor si ya viene con uno
watch(() => props.form.monto, (newVal) => {
  if (!isNaN(newVal)) {
    montoInput.value = newVal.toFixed(2)
  }
}, { immediate: true })
</script>

<template>
  <div class="step-content">
    <div class="form-group amount-group">
      <label for="monto">Monto (USD)</label>
      <div class="input-with-prefix">
        <span class="prefix">$</span>
        <input
          type="text"
          id="monto"
          :value="montoInput"
          @input="onMontoInput"
          inputmode="numeric"
          placeholder="0.00"
          required
        />
      </div>
    </div>

    <div class="form-group">
      <label for="descripcion">Descripción</label>
      <textarea id="descripcion" v-model="form.descripcion" required rows="3" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/index.scss' as *;

.step-content {
  animation: fadeIn 0.3s ease;
  padding: 1rem 0;
}

.form-group {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;

  label {
    font-size: 0.95rem;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: $BAKANO-DARK;
  }

  input,
  textarea {
    padding: 0.75rem 1rem;
    font-size: 1rem;
    border: 2px solid rgba($BAKANO-DARK, 0.1);
    border-radius: 8px;
    background: $white;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;

    &:focus {
      border-color: $BAKANO-PINK;
      box-shadow: 0 0 0 3px rgba($BAKANO-PINK, 0.1);
      outline: none;
    }
  }

  textarea {
    resize: vertical;
    min-height: 100px;
  }
}

.amount-group {
  .input-with-prefix {
    position: relative;
    display: flex;
    align-items: center;

    .prefix {
      position: absolute;
      left: 1rem;
      color: $BAKANO-DARK;
      font-size: 1rem;
      font-weight: 500;
      pointer-events: none;
    }

    input {
      padding-left: 2rem !important;
      text-align: left;
      font-variant-numeric: tabular-nums;
    }
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
