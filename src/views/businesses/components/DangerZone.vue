<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  isLoading: boolean
}>()

const emit = defineEmits<{
  (e: 'delete-business'): void
}>()

const isRevealed = ref(false)
</script>

<template>
  <div>
    <div v-if="isRevealed" class="danger-zone-card">
      <header class="header">
        <i class="fas fa-exclamation-triangle icon"></i>
        <h3 class="title">Zona de Riesgo</h3>
      </header>
      <div class="content">
        <div class="action-item">
          <div class="action-info">
            <h4 class="action-title">Eliminar este negocio</h4>
            <p class="action-description">
              Esta acción no se puede deshacer. Se eliminarán permanentemente el negocio, sus datos asociados y se notificará al propietario y a los administradores.
            </p>
          </div>
          <button
            class="btn-danger"
            @click="emit('delete-business')"
            :disabled="props.isLoading"
          >
            <span v-if="props.isLoading">
              <i class="fas fa-spinner fa-spin"></i> Eliminando...
            </span>
            <span v-else>Eliminar Negocio</span>
          </button>
        </div>
      </div>
    </div>

    <div v-else class="reveal-zone-card">
      <div class="action-info">
        <h4 class="action-title">Acciones de Riesgo</h4>
        <p class="action-description">
          Accede a esta sección para realizar acciones permanentes y destructivas, como eliminar el negocio.
        </p>
      </div>
      <button class="btn-reveal" @click="isRevealed = true">
        Acceder a Zona de Riesgo
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/index.scss' as *;

// --- Estilos para la ZONA DE RIESGO REVELADA ---
.danger-zone-card {
  border: 2px solid $BAKANO-PINK;
  border-radius: 12px;
  background-color: lighten($BAKANO-PINK, 42%);
}

.header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-bottom: 2px solid lighten($BAKANO-PINK, 35%);

  .icon {
    font-size: 1.25rem;
    color: darken($BAKANO-PINK, 10%);
  }

  .title {
    font-family: $font-principal;
    font-weight: 700;
    font-size: 1.1rem;
    color: darken($BAKANO-PINK, 10%);
    margin: 0;
  }
}

.content {
  padding: 1.5rem;
}

.btn-danger {
  font-family: $font-principal;
  font-weight: 600;
  background-color: $BAKANO-PINK;
  color: $white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;

  &:hover:not(:disabled) {
    background-color: darken($BAKANO-PINK, 10%);
    box-shadow: 0 4px 15px rgba($BAKANO-PINK, 0.3);
    transform: translateY(-2px);
  }

  &:disabled {
    background-color: lighten($BAKANO-PINK, 20%);
    cursor: not-allowed;
  }
}


// --- Estilos para la "PUERTA DE ENTRADA" ---
.reveal-zone-card {
  border: 2px dashed darken($BAKANO-LIGHT, 15%);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  text-align: center;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    text-align: left;
  }
}

.btn-reveal {
  font-family: $font-principal;
  font-weight: 600;
  background-color: transparent;
  color: $BAKANO-DARK;
  border: 2px solid $BAKANO-DARK;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background-color: $BAKANO-DARK;
    color: $white;
  }
}

// --- Estilos Compartidos ---
.action-item {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

.action-info {
  flex-grow: 1;
}

.action-title {
  font-family: $font-principal;
  font-weight: 600;
  color: $BAKANO-DARK;
  margin: 0 0 0.25rem 0;
  font-size: 1.1rem;
}

.action-description {
  font-family: $font-secondary;
  font-size: 0.9rem;
  color: rgba($BAKANO-DARK, 0.8);
  margin: 0;
  line-height: 1.6;
  max-width: 600px;
}
</style>