import { ref, computed } from 'vue'
import { useChecklistStore } from '@/stores/checklist'
import { useToast } from '@/composables/useToast'
import type { UpdatePhaseObservationsRequest } from '@/types/checklist.interface'

/**
 * Composable para manejar las observaciones de fases del checklist
 * Proporciona funcionalidad para mostrar, editar y actualizar observaciones
 */
export function usePhaseObservations() {
  const checklistStore = useChecklistStore()
  const { triggerToast } = useToast()

  // Estado local para el manejo de observaciones
  const isEditingObservations = ref<string | null>(null)
  const observationsText = ref('')
  const isUpdatingObservations = ref(false)

  /**
   * Computed para obtener las observaciones de una fase específica
   */
  const getPhaseObservations = computed(() => {
    return (phaseId: string): string => {
      const phase = checklistStore.getPhaseById(phaseId)
      return phase?.observations || ''
    }
  })

  /**
   * Inicia la edición de observaciones para una fase
   */
  const startEditingObservations = (phaseId: string) => {
    const currentObservations = getPhaseObservations.value(phaseId)
    observationsText.value = currentObservations
    isEditingObservations.value = phaseId
  }

  /**
   * Cancela la edición de observaciones
   */
  const cancelEditingObservations = () => {
    isEditingObservations.value = null
    observationsText.value = ''
  }

  /**
   * Guarda las observaciones de una fase
   */
  const saveObservations = async (businessId: string, phaseId: string) => {
    if (!observationsText.value.trim()) {
      triggerToast('Las observaciones no pueden estar vacías', 'warning')
      return false
    }

    try {
      isUpdatingObservations.value = true

      const data: UpdatePhaseObservationsRequest = {
        observations: observationsText.value.trim()
      }

      await checklistStore.updatePhaseObservations(businessId, phaseId, data)
      
      triggerToast('Observaciones actualizadas exitosamente', 'success')
      cancelEditingObservations()
      return true
    } catch (error: any) {
      triggerToast(
        error.message || 'Error al actualizar las observaciones', 
        'error'
      )
      return false
    } finally {
      isUpdatingObservations.value = false
    }
  }

  /**
   * Verifica si una fase específica está siendo editada
   */
  const isPhaseBeingEdited = computed(() => {
    return (phaseId: string): boolean => {
      return isEditingObservations.value === phaseId
    }
  })

  /**
   * Verifica si hay observaciones para mostrar en una fase
   */
  const hasObservations = computed(() => {
    return (phaseId: string): boolean => {
      return getPhaseObservations.value(phaseId).length > 0
    }
  })

  /**
   * Obtiene el texto de placeholder para el textarea de observaciones
   */
  const getObservationsPlaceholder = computed(() => {
    return (phaseName: string): string => {
      return `Agregar observaciones para la fase "${phaseName}"...`
    }
  })

  /**
   * Valida si se pueden guardar las observaciones
   */
  const canSaveObservations = computed(() => {
    return observationsText.value.trim().length > 0 && !isUpdatingObservations.value
  })

  return {
    // Estado reactivo
    isEditingObservations,
    observationsText,
    isUpdatingObservations,

    // Computed properties
    getPhaseObservations,
    isPhaseBeingEdited,
    hasObservations,
    getObservationsPlaceholder,
    canSaveObservations,

    // Métodos
    startEditingObservations,
    cancelEditingObservations,
    saveObservations
  }
}