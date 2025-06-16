<script setup lang="ts">
const emit = defineEmits<{
  (e: 'select', method: 'datil' | 'transferencia'): void
}>()
</script>

<template>
  <div class="step0">
    <h3>¿Qué tipo de pago manual deseas registrar?</h3>
    <div class="method-options">
      <div class="method-card" @click="emit('select', 'datil')">
        <i class="fas fa-hand-holding-usd"></i>
        <h4>Registrar con Dátil</h4>
        <p>Registra un pago procesado a través del servicio de Dátil.</p>
      </div>
      <div class="method-card" @click="emit('select', 'transferencia')">
        <i class="fas fa-university"></i>
        <h4>Registrar Transferencia</h4>
        <p>Registra un pago recibido por transferencia bancaria directa.</p>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/index.scss' as *;

.step0 {
  padding: 1rem 0;
  text-align: center;

  h3 {
    font-size: 1.25rem;
    color: $BAKANO-PURPLE;
    margin-bottom: 2rem;
  }
}

.method-options {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
}

.method-card {
  flex: 1;
  padding: 2rem 1.5rem;
  border: 2px solid rgba($BAKANO-PURPLE, 0.2);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    border-color: $BAKANO-PINK;
    box-shadow: 0 8px 20px rgba($BAKANO-PINK, 0.1);
  }

  i {
    font-size: 2.5rem;
    color: $BAKANO-PINK;
    margin-bottom: 1rem;
  }

  h4 {
    font-size: 1.1rem;
    font-weight: 600;
    color: $BAKANO-DARK;
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 0.9rem;
    color: rgba($BAKANO-DARK, 0.7);
    line-height: 1.5;
  }
}

@media (max-width: 600px) {
  .method-options {
    flex-direction: column;
  }
}
</style>