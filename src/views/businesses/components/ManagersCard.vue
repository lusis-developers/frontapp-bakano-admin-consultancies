<script setup lang="ts">
import { ref } from 'vue';
import type { IManager } from '@/types/manager.interface';
// 1. Importa el composable
import { useConfirmationDialog } from '@/composables/useConfirmationDialog';

// 2. Obtén la función `reveal`
const { reveal } = useConfirmationDialog();

const props = defineProps<{
  managers: IManager[];
  isLoading: boolean;
}>();

const emit = defineEmits<{
  (e: 'add-manager', payload: Omit<IManager, '_id'>): void;
  (e: 'remove-manager', managerId: string): void;
}>();

const newManager = ref<Omit<IManager, '_id'>>({
  name: '',
  email: '',
  role: 'Administrador',
});

const handleAddSubmit = () => {
  if (!newManager.value.name.trim() || !newManager.value.email.trim()) {
    alert('El nombre y el email son requeridos.');
    return;
  }
  emit('add-manager', newManager.value);
  newManager.value = { name: '', email: '', role: 'Administrador' };
};

// 3. Modifica la función de eliminar para usar `reveal`
const handleRemoveClick = async (managerId: string) => {
  try {
    // Esto muestra el modal y ESPERA la respuesta del usuario.
    await reveal({
      title: '¿Seguro que quieres eliminar?',
      message: 'Esta acción eliminará permanentemente al administrador y le revocará el acceso.',
      confirmationText: 'borrar'
    });

    // Si el usuario escribe "borrar" y confirma, el código continúa aquí.
    emit('remove-manager', managerId);

  } catch {
    // Si el usuario cancela o cierra el modal, la promesa se rechaza y no se hace nada.
    console.log('Eliminación cancelada por el usuario.');
  }
};
</script>

<template>
  <div class="card">
    <h3 class="card-title">Administradores</h3>
    <p class="card-description">
      Agrega o elimina a las personas que gestionarán este negocio.
    </p>

    <form @submit.prevent="handleAddSubmit" class="add-manager-form">
      <input
        v-model="newManager.name"
        type="text"
        placeholder="Nombre completo del administrador"
        class="form-input"
        required
        :disabled="props.isLoading"
      />
      <input
        v-model="newManager.email"
        type="email"
        placeholder="Email de contacto"
        class="form-input"
        required
        :disabled="props.isLoading"
      />
      <select v-model="newManager.role" class="form-select" :disabled="props.isLoading">
        <option>Administrador</option>
        <option>Contador</option>
        <option>Editor</option>
      </select>
      <button type="submit" class="add-btn" :disabled="props.isLoading">
        <span v-if="props.isLoading">...</span>
        <span v-else>+ Agregar</span>
      </button>
    </form>

    <div class="managers-list-container">
      <ul class="managers-list">
        <li v-if="props.managers.length === 0 && !props.isLoading" class="empty-state">
          No hay administradores asignados.
        </li>
        <li v-for="manager in props.managers" :key="manager._id" class="manager-item">
          <div class="manager-info">
            <span class="manager-name">{{ manager.name }}</span>
            <span class="manager-email">{{ manager.email }}</span>
          </div>
          <div class="manager-actions">
            <span class="role-badge">{{ manager.role }}</span>
            <button
              @click="handleRemoveClick(manager._id)"
              class="remove-btn"
              :disabled="props.isLoading"
              aria-label="Eliminar"
            >
              &times;
            </button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/index.scss' as *;

.card {
  background: $white;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid $BAKANO-LIGHT;
  box-shadow: 0 4px 12px rgba($BAKANO-DARK, 0.05);
  grid-column: 1 / -1;
}

.card-title {
  font-family: $font-principal;
  font-weight: 600;
  font-size: 1.2rem;
  color: $BAKANO-DARK;
  margin: 0 0 0.25rem 0;
  padding-bottom: 1rem;
  border-bottom: 1px solid $BAKANO-LIGHT;
}

.card-description {
  font-family: $font-secondary;
  font-size: 0.9rem;
  color: rgba($BAKANO-DARK, 0.7);
  margin: 0.5rem 0 1.5rem 0;
}

.add-manager-form {
  display: flex;
  flex-direction: column; // Apilado vertical para móviles
  gap: 0.75rem;
  margin-bottom: 1.5rem;

  .form-input,
  .form-select,
  .add-btn {
    width: 100%; // Ocupan todo el ancho en móvil
    font-size: 1rem; // Tamaño de fuente legible en móvil
    padding: 0.8rem 1rem;
    border-radius: 8px;
    border: 1px solid $BAKANO-LIGHT;
    font-family: $font-secondary;
  }

  .form-input,
  .form-select {
    background-color: lighten($BAKANO-LIGHT, 2%);
    width: 80%;

    &:focus {
      outline: none;
      border-color: $BAKANO-PURPLE;
      background-color: $white;
      box-shadow: 0 0 0 3px $overlay-purple;
    }
  }

  .add-btn {
    font-family: $font-principal;
    font-weight: 600;
    background-color: $BAKANO-PURPLE;
    color: $white;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover:not(:disabled) {
      background-color: darken($BAKANO-PURPLE, 8%);
    }

    &:disabled {
      background-color: $BAKANO-LIGHT;
      color: rgba($BAKANO-DARK, 0.4);
      cursor: not-allowed;
    }
  }
}

.managers-list-container {
  max-height: 300px;
  overflow-y: auto;
}

.managers-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.empty-state {
  text-align: center;
  padding: 2.5rem 1rem;
  font-family: $font-secondary;
  color: rgba($BAKANO-DARK, 0.5);
  font-style: italic;
  border: 2px dashed $BAKANO-LIGHT;
  border-radius: 8px;
}

.manager-item {
  display: flex;
  flex-wrap: wrap; // Permite que los elementos se ajusten
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem 1rem; // Espacio vertical y horizontal
  padding: 0.75rem 0;

  &:not(:last-child) {
    border-bottom: 1px solid $BAKANO-LIGHT;
  }
}

.manager-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex-grow: 1; // Permite que ocupe el espacio disponible
}


.manager-name {
  font-weight: 500;
  color: $BAKANO-DARK;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.manager-email {
  color: rgba($BAKANO-DARK, 0.6);
  font-size: 0.85rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.manager-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0; // Evita que se encoja
}

.role-badge {
  background-color: $overlay-purple;
  color: $BAKANO-PURPLE;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.remove-btn {
  background: none;
  border: none;
  color: rgba($BAKANO-DARK, 0.4);
  cursor: pointer;
  font-size: 1.5rem;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    background-color: $BAKANO-PINK;
    color: $white;
    transform: rotate(90deg);
  }
}


/* --- Estilos para Pantallas Más Grandes (Tablet y Escritorio) --- */
/* Usamos `min-width` para agregar estilos a medida que la pantalla crece. */
@media (min-width: 768px) {
  .add-manager-form {
    flex-direction: row; // Volvemos al layout horizontal

    .form-input {
      flex-grow: 1;
      flex-basis: 200px; // Ancho base
    }

    .form-select {
      flex-grow: 0; // No crece tanto
      flex-basis: 150px;
    }

    .add-btn {
      flex-grow: 0; // No crece
      width: auto; // El ancho se adapta al contenido
    }
  }

  .manager-item {
    flex-wrap: nowrap; // Evitamos el salto de línea en pantallas grandes
  }
}
</style>