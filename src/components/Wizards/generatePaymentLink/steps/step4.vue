<script setup lang="ts">
defineProps<{
  paymentResponse: any,
  copySuccess: boolean
}>()

const emit = defineEmits<{
  (e: 'copy'): void
  (e: 'new'): void
}>()
</script>

<template>
  <div class="step-content success-content">
    <div class="success-icon">
      <i class="fas fa-check-circle"></i>
    </div>
    <h3>¡Enlace generado exitosamente!</h3>

    <div class="url-container">
      <div class="url-box">
        <div class="url-text">{{ paymentResponse.url }}</div>
        <button
          type="button"
          class="copy-button"
          :class="{ 'copy-success': copySuccess }"
          @click="emit('copy')"
        >
          <i class="fas fa-copy"></i>
          <span v-if="!copySuccess">Copiar</span>
          <span v-else>¡Copiado!</span>
        </button>
      </div>
      <div class="url-info">Comparte este enlace con el cliente para que realice el pago.</div>
    </div>

    <div class="success-actions">
      <a :href="paymentResponse.url" target="_blank" class="visit-button">
        <i class="fas fa-external-link-alt"></i> Ver Enlace
      </a>
      <button class="new-payment-button" @click="emit('new')">
        <i class="fas fa-plus-circle"></i> Nuevo Pago
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/index.scss' as *;

.step-content.success-content {
  text-align: center;
  padding: 2rem 1rem;

  .success-icon {
    font-size: 4rem;
    color: #4CAF50;
    margin-bottom: 1rem;
    animation: scaleIn 0.5s ease;
  }

  h3 {
    color: $BAKANO-DARK;
    margin-bottom: 2rem;
    font-size: 1.5rem;
  }
}

.url-container {
  margin: 2rem 0;
}

.url-box {
  background: rgba($BAKANO-DARK, 0.05);
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;

  .url-text {
    flex: 1;
    word-break: break-word;
    font-family: monospace;
    color: $BAKANO-DARK;
    text-align: left;
  }
}

.url-info {
  font-size: 0.9rem;
  color: rgba($BAKANO-DARK, 0.7);
  margin-top: 0.5rem;
}

.copy-button {
  background: $white;
  border: 2px solid rgba($BAKANO-DARK, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;

  &:hover {
    background: rgba($BAKANO-DARK, 0.05);
  }

  &.copy-success {
    background: #4CAF50;
    color: $white;
    border-color: #4CAF50;
  }
}

.success-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;

  .visit-button,
  .new-payment-button {
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    text-decoration: none;
  }

  .visit-button {
    background: $BAKANO-PINK;
    color: $white;

    &:hover {
      background: darken($BAKANO-PINK, 5%);
      transform: translateY(-1px);
    }
  }

  .new-payment-button {
    background: $white;
    border: 2px solid rgba($BAKANO-DARK, 0.1);
    color: $BAKANO-DARK;

    &:hover {
      background: rgba($BAKANO-DARK, 0.05);
    }
  }
}

@keyframes scaleIn {
  from {
    transform: scale(0);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>

