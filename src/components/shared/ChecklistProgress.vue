<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useChecklistStore } from '@/stores/checklist'
import type { IChecklistItem, IChecklistPhase } from '@/types/checklist.interface'
import { useToast } from '@/composables/useToast'
import { useConfirmationDialog } from '@/composables/useConfirmationDialog'

const props = defineProps({
  businessId: {
    type: String,
    required: true,
  },
  managerId: {
    type: String,
    required: false,
    default: undefined,
  },
})

const checklistStore = useChecklistStore()
const { triggerToast } = useToast()
const { reveal } = useConfirmationDialog()

const isExpanded = ref(false)
const loadingItems = ref<Set<string>>(new Set())
const selectedPhaseIndex = ref<number | null>(null)

const currentPhaseProgress = computed(() => {
  if (!checklistStore.currentPhase) return 0
  const phase = checklistStore.currentPhase
  const completedItems = phase.items.filter(item => item.completed).length
  return Math.round((completedItems / phase.items.length) * 100)
})

const overallProgress = computed(() => {
  if (!checklistStore.checklist) return 0
  const totalItems = checklistStore.checklist.phases.reduce((acc, phase) => acc + phase.items.length, 0)
  const completedItems = checklistStore.checklist.phases.reduce(
    (acc, phase) => acc + phase.items.filter(item => item.completed).length,
    0
  )
  return Math.round((completedItems / totalItems) * 100)
})

const canMoveToNextPhase = computed(() => {
  if (!checklistStore.currentPhase) return false
  return checklistStore.currentPhase.items.every(item => item.completed)
})

const handleToggleItem = async (phaseId: string, item: IChecklistItem) => {
  const itemKey = `${phaseId}-${item.id}`
  loadingItems.value.add(itemKey)
  
  try {
    await checklistStore.toggleItemCompletion(
      props.businessId,
      phaseId,
      item.id,
      props.managerId
    )
    
    triggerToast(
      item.completed ? 'Item marcado como pendiente' : 'Item completado exitosamente',
      'success'
    )
  } catch (error: any) {
    triggerToast(error.message || 'Error al actualizar el item', 'error')
  } finally {
    loadingItems.value.delete(itemKey)
  }
}

const handleMoveToNextPhase = async () => {
  if (!checklistStore.currentPhase) return
  
  try {
    const confirmed = await reveal({
      title: 'Avanzar a la siguiente fase',
      message: `¿Estás seguro de que quieres avanzar de "${checklistStore.currentPhase.name}" a la siguiente fase? Esta acción no se puede deshacer.`,
    })
    
    if (confirmed) {
      await checklistStore.moveToNextPhase(props.businessId)
      triggerToast('Fase avanzada exitosamente', 'success')
    }
  } catch (error: any) {
    if (error.message) {
      triggerToast(error.message, 'error')
    }
  }
}

const getPhaseStatusClass = (phase: IChecklistPhase, index: number) => {
  if (!checklistStore.checklist) return 'pending'
  
  if (index < checklistStore.checklist.currentPhase) return 'completed'
  if (index === checklistStore.checklist.currentPhase) return 'current'
  return 'pending'
}

const getItemIcon = (item: IChecklistItem) => {
  return item.completed ? 'fas fa-check-circle' : 'far fa-circle'
}

const isItemLoading = (phaseId: string, itemId: string) => {
  return loadingItems.value.has(`${phaseId}-${itemId}`)
}

const selectPhase = (index: number) => {
  // Si ya está seleccionada la misma fase, la desmarcamos
  if (selectedPhaseIndex.value === index) {
    selectedPhaseIndex.value = null
    return
  }
  // Si es la fase actual y no hay ninguna seleccionada, la desmarcamos también
  if (index === checklistStore.checklist?.currentPhase && selectedPhaseIndex.value === null) {
    return
  }
  // Seleccionar la nueva fase
  selectedPhaseIndex.value = index
}

const getSelectedPhase = computed(() => {
  if (selectedPhaseIndex.value === null || !checklistStore.checklist) {
    return checklistStore.currentPhase
  }
  return checklistStore.checklist.phases[selectedPhaseIndex.value]
})

const getSelectedPhaseProgress = computed(() => {
  const phase = getSelectedPhase.value
  if (!phase) return 0
  const completedItems = phase.items.filter(item => item.completed).length
  return Math.round((completedItems / phase.items.length) * 100)
})

onMounted(async () => {
  await Promise.all([
    checklistStore.fetchChecklist(props.businessId),
    checklistStore.fetchProgress(props.businessId)
  ])
})
</script>

<template>
  <div class="checklist-progress">
    <div class="checklist-header" @click="isExpanded = !isExpanded">
      <div class="header-content">
        <div class="header-info">
          <h3>
            <i class="fas fa-tasks header-icon"></i>
            Progreso del Checklist
          </h3>
          <div class="progress-summary">
            <span class="progress-text">{{ overallProgress }}% completado</span>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: `${overallProgress}%` }"></div>
            </div>
          </div>
        </div>
        <button class="expand-btn" :class="{ expanded: isExpanded }">
          <i class="fas fa-chevron-down"></i>
        </button>
      </div>
    </div>

    <div v-if="checklistStore.isLoading && !checklistStore.checklist" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i> Cargando checklist...
    </div>

    <div v-else-if="checklistStore.error" class="error-state">
      <i class="fas fa-exclamation-triangle"></i>
      <span>{{ checklistStore.error }}</span>
    </div>

    <div v-else-if="checklistStore.checklist && isExpanded" class="checklist-content">
      <!-- Fases Overview -->
      <div class="phases-overview">
        <div 
          v-for="(phase, index) in checklistStore.checklist.phases" 
          :key="phase.id"
          class="phase-indicator"
          :class="[
            getPhaseStatusClass(phase, index),
            { 'selected': selectedPhaseIndex === index }
          ]"
          @click="selectPhase(index)"
        >
          <div class="phase-number">{{ index + 1 }}</div>
          <span class="phase-name">{{ phase.name }}</span>
          <div class="phase-items-count">
            {{ phase.items.filter(item => item.completed).length }}/{{ phase.items.length }}
          </div>
        </div>
      </div>

      <!-- Fase Seleccionada o Actual -->
      <div v-if="getSelectedPhase" class="current-phase">
        <div class="phase-header">
          <h4>
            {{ getSelectedPhase.name }}
            <span v-if="selectedPhaseIndex !== null" class="phase-status-badge">
              {{ selectedPhaseIndex < checklistStore.checklist!.currentPhase ? 'Completada' : 
                  selectedPhaseIndex === checklistStore.checklist!.currentPhase ? 'Actual' : 'Pendiente' }}
            </span>
          </h4>
          <div class="phase-progress">
            <span class="progress-text">{{ getSelectedPhaseProgress }}%</span>
            <div class="progress-bar small">
              <div class="progress-fill" :style="{ width: `${getSelectedPhaseProgress}%` }"></div>
            </div>
          </div>
        </div>

        <div class="items-list">
          <div 
            v-for="item in getSelectedPhase.items" 
            :key="item.id"
            class="checklist-item"
            :class="{ 
              completed: item.completed, 
              loading: isItemLoading(getSelectedPhase.id, item.id)
            }"
          >
            <button 
              @click="handleToggleItem(getSelectedPhase.id, item)"
              class="item-toggle"
              :disabled="isItemLoading(getSelectedPhase.id, item.id)"
            >
              <i v-if="isItemLoading(getSelectedPhase.id, item.id)" class="fas fa-spinner fa-spin"></i>
              <i v-else :class="getItemIcon(item)"></i>
            </button>
            <div class="item-content">
              <span class="item-title">{{ item.title }}</span>
              <p v-if="item.description" class="item-description">{{ item.description }}</p>
              <div v-if="item.completed && item.completedBy" class="item-meta">
                <i class="fas fa-user"></i>
                <span>Completado por: {{ item.completedBy }}</span>
                <i class="fas fa-clock"></i>
                <span>{{ new Date(item.completedAt!).toLocaleDateString() }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="canMoveToNextPhase && !checklistStore.isChecklistComplete && (selectedPhaseIndex === null || selectedPhaseIndex === checklistStore.checklist!.currentPhase)" class="phase-actions">
          <button 
            @click="handleMoveToNextPhase"
            class="btn-next-phase"
            :disabled="checklistStore.isLoading"
          >
            <i class="fas fa-arrow-right"></i>
            Avanzar a la siguiente fase
          </button>
        </div>

        <div v-if="checklistStore.isChecklistComplete" class="completion-message">
          <i class="fas fa-trophy"></i>
          <span>¡Checklist completado exitosamente!</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/index.scss' as *;

.checklist-progress {
  background: $white;
  border: 1px solid $BAKANO-LIGHT;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba($BAKANO-DARK, 0.03);
}

.checklist-header {
  padding: 1.25rem;
  background: lighten($BAKANO-LIGHT, 3%);
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: lighten($BAKANO-LIGHT, 1%);
  }
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.header-info {
  flex: 1;
  
  h3 {
    font-family: $font-principal;
    font-size: 1.1rem;
    font-weight: 600;
    color: $BAKANO-DARK;
    margin: 0 0 0.75rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
}

.header-icon {
  color: $BAKANO-PURPLE;
  font-size: 1rem;
}

.progress-summary {
  display: flex;
  align-items: center;
  gap: 1rem;
  
  .progress-text {
    font-weight: 600;
    color: $BAKANO-DARK;
    font-size: 0.9rem;
    min-width: 80px;
  }
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: rgba($BAKANO-LIGHT, 0.5);
  border-radius: 4px;
  overflow: hidden;
  
  &.small {
    height: 6px;
  }
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, $BAKANO-PURPLE, lighten($BAKANO-PURPLE, 10%));
  border-radius: 4px;
  transition: width 0.3s ease;
}

.expand-btn {
  background: none;
  border: none;
  color: $BAKANO-PURPLE;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba($BAKANO-PURPLE, 0.1);
  }
  
  &.expanded {
    transform: rotate(180deg);
  }
}

.loading-state,
.error-state {
  padding: 2rem;
  text-align: center;
  color: rgba($BAKANO-DARK, 0.6);
  
  i {
    margin-right: 0.5rem;
  }
}

.error-state {
  color: $BAKANO-PINK;
  background: lighten($BAKANO-PINK, 45%);
}

.checklist-content {
  padding: 1.5rem;
}

.phases-overview {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.phase-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  min-width: 80px;
  padding: 0.75rem 0.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba($BAKANO-DARK, 0.1);
  }
  
  &.selected {
    border: 2px solid $BAKANO-PURPLE;
    box-shadow: 0 0 0 3px rgba($BAKANO-PURPLE, 0.1);
  }
  
  &.completed {
    background: lighten($BAKANO-GREEN, 35%);
    
    .phase-number {
      background: $BAKANO-GREEN;
      color: $white;
    }
    
    .phase-name {
      color: darken($BAKANO-GREEN, 10%);
      font-weight: 600;
    }
    
    &.selected {
      border-color: $BAKANO-GREEN;
      box-shadow: 0 0 0 3px rgba($BAKANO-GREEN, 0.1);
    }
  }
  
  &.current {
    background: lighten($BAKANO-PURPLE, 35%);
    
    .phase-number {
      background: $BAKANO-PURPLE;
      color: $white;
    }
    
    .phase-name {
      color: darken($BAKANO-PURPLE, 10%);
      font-weight: 600;
    }
  }
  
  &.pending {
    background: lighten($BAKANO-LIGHT, 2%);
    
    .phase-number {
      background: rgba($BAKANO-DARK, 0.2);
      color: rgba($BAKANO-DARK, 0.6);
    }
    
    .phase-name {
      color: rgba($BAKANO-DARK, 0.6);
    }
    
    &.selected {
      border-color: rgba($BAKANO-DARK, 0.3);
      box-shadow: 0 0 0 3px rgba($BAKANO-DARK, 0.05);
    }
  }
}

.phase-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
}

.phase-name {
  font-size: 0.8rem;
  text-align: center;
  line-height: 1.2;
}

.phase-items-count {
  font-size: 0.7rem;
  color: rgba($BAKANO-DARK, 0.6);
  font-weight: 500;
  background: rgba($white, 0.8);
  padding: 0.2rem 0.4rem;
  border-radius: 10px;
  margin-top: 0.2rem;
}

.current-phase {
  .phase-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid $BAKANO-LIGHT;
    
    h4 {
      font-family: $font-principal;
      font-size: 1.2rem;
      font-weight: 600;
      color: $BAKANO-DARK;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
  }
  
  .phase-progress {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-width: 120px;
  }
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.checklist-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid $BAKANO-LIGHT;
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: lighten($BAKANO-PURPLE, 20%);
    background: lighten($BAKANO-PURPLE, 45%);
  }
  
  &.completed {
    background: lighten($BAKANO-GREEN, 45%);
    border-color: lighten($BAKANO-GREEN, 20%);
    
    .item-title {
      text-decoration: line-through;
      color: rgba($BAKANO-DARK, 0.7);
    }
  }
  
  &.loading {
    opacity: 0.7;
    pointer-events: none;
  }
  

}

.item-toggle {
  background: none;
  border: none;
  color: $BAKANO-PURPLE;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  transition: all 0.2s ease;
  flex-shrink: 0;
  
  &:hover:not(:disabled) {
    background: rgba($BAKANO-PURPLE, 0.1);
    transform: scale(1.1);
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
}

.item-content {
  flex: 1;
  
  .item-title {
    font-weight: 600;
    color: $BAKANO-DARK;
    display: block;
    margin-bottom: 0.25rem;
  }
  
  .item-description {
    color: rgba($BAKANO-DARK, 0.7);
    font-size: 0.9rem;
    line-height: 1.4;
    margin: 0 0 0.5rem 0;
  }
  
  .item-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8rem;
    color: rgba($BAKANO-DARK, 0.6);
    
    i {
      color: $BAKANO-PURPLE;
    }
  }
}

.phase-actions {
  display: flex;
  justify-content: center;
  padding-top: 1rem;
  border-top: 1px solid $BAKANO-LIGHT;
}

.btn-next-phase {
  background: $BAKANO-GREEN;
  color: $white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-family: $font-principal;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover:not(:disabled) {
    background: darken($BAKANO-GREEN, 8%);
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba($BAKANO-GREEN, 0.3);
  }
  
  &:disabled {
    background: rgba($BAKANO-DARK, 0.3);
    cursor: not-allowed;
  }
}

.completion-message {
  text-align: center;
  padding: 1.5rem;
  background: lighten($BAKANO-GREEN, 45%);
  border-radius: 8px;
  color: darken($BAKANO-GREEN, 10%);
  font-weight: 600;
  
  i {
    margin-right: 0.5rem;
    font-size: 1.2rem;
  }
}

.phase-status-badge {
  font-size: 0.8rem;
  font-weight: 500;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  background: rgba($BAKANO-PURPLE, 0.1);
  color: $BAKANO-PURPLE;
  border: 1px solid rgba($BAKANO-PURPLE, 0.2);
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
  
  .progress-summary {
    flex-direction: column;
    gap: 0.5rem;
    align-items: stretch;
  }
  
  .phases-overview {
    justify-content: center;
  }
  
  .phase-indicator {
    min-width: 60px;
    
    .phase-name {
      font-size: 0.7rem;
    }
  }
  
  .current-phase .phase-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .checklist-item {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>