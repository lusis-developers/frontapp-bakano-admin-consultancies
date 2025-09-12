import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  IChecklist,
  IChecklistPhase,
  IChecklistItem,
  UpdateChecklistItemRequest
} from '@/types/checklist.interface'
import { checklistService } from '@/services/checklistService'

export const useChecklistStore = defineStore('checklist', () => {
  // State
  const checklist = ref<IChecklist | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const progress = ref<{
    totalPhases: number
    completedPhases: number
    currentPhase: number
    currentPhaseName: string
    totalItems: number
    completedItems: number
    overallProgress: number
  } | null>(null)

  // Getters
  const currentPhase = computed(() => {
    if (!checklist.value) return null
    return checklist.value.phases[checklist.value.currentPhase] || null
  })

  const isChecklistComplete = computed(() => {
    if (!checklist.value) return false
    return checklist.value.phases.every(phase => phase.completed)
  })

  const getPhaseById = computed(() => {
    return (phaseId: string): IChecklistPhase | null => {
      if (!checklist.value) return null
      return checklist.value.phases.find(phase => phase.id === phaseId) || null
    }
  })

  const getItemById = computed(() => {
    return (phaseId: string, itemId: string): IChecklistItem | null => {
      const phase = getPhaseById.value(phaseId)
      if (!phase) return null
      return phase.items.find(item => item.id === itemId) || null
    }
  })

  // Actions
  const fetchChecklist = async (businessId: string) => {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await checklistService.getBusinessChecklist(businessId)
      checklist.value = response.data.checklist
    } catch (err: any) {
      error.value = err.message || 'Error al obtener el checklist'
      console.error('Error fetching checklist:', err)
    } finally {
      isLoading.value = false
    }
  }

  const fetchProgress = async (businessId: string) => {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await checklistService.getChecklistProgress(businessId)
      progress.value = response.data.progress
    } catch (err: any) {
      error.value = err.message || 'Error al obtener el progreso del checklist'
      console.error('Error fetching progress:', err)
    } finally {
      isLoading.value = false
    }
  }

  const updateItem = async (
    businessId: string,
    phaseId: string,
    itemId: string,
    data: UpdateChecklistItemRequest
  ) => {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await checklistService.updateChecklistItem(
        businessId,
        phaseId,
        itemId,
        data
      )
      
      // Actualizar el estado local
      checklist.value = response.data.checklist
      
      return response
    } catch (err: any) {
      error.value = err.message || 'Error al actualizar el item del checklist'
      console.error('Error updating checklist item:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const toggleItemCompletion = async (
    businessId: string,
    phaseId: string,
    itemId: string,
    completedBy?: string
  ) => {
    const item = getItemById.value(phaseId, itemId)
    if (!item) {
      throw new Error('Item no encontrado')
    }

    const data: UpdateChecklistItemRequest = {
      completed: !item.completed,
      completedBy
    }

    return await updateItem(businessId, phaseId, itemId, data)
  }

  const moveToNextPhase = async (businessId: string) => {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await checklistService.moveToNextPhase(businessId)
      
      // Actualizar el estado local
      checklist.value = response.data.checklist
      
      return response
    } catch (err: any) {
      error.value = err.message || 'Error al mover a la siguiente fase'
      console.error('Error moving to next phase:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  const resetStore = () => {
    checklist.value = null
    isLoading.value = false
    error.value = null
    progress.value = null
  }

  return {
    // State
    checklist,
    isLoading,
    error,
    progress,
    
    // Getters
    currentPhase,
    isChecklistComplete,
    getPhaseById,
    getItemById,
    
    // Actions
    fetchChecklist,
    fetchProgress,
    updateItem,
    toggleItemCompletion,
    moveToNextPhase,
    clearError,
    resetStore
  }
})