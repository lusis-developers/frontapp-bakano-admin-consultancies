<script setup lang="ts">
defineProps<{
  form: any
}>()
</script>

<template>
  <div class="step-content">
    <div class="form-row">
      <div class="form-group">
        <label for="nombreNegocio">Nombre del Negocio</label>
        <input type="text" id="nombreNegocio" v-model="form.nombreNegocio" required />
      </div>

      <div class="form-group">
        <label for="prefijo">Prefijo</label>
        <input type="text" id="prefijo" v-model="form.prefijo" required />
      </div>
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
