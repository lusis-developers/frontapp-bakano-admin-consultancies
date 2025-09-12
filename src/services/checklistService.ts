import type {
  IChecklist,
  ChecklistResponse,
  ChecklistProgressResponse,
  UpdateChecklistItemRequest
} from '@/types/checklist.interface'
import APIBase from './httpBase'

class ChecklistService extends APIBase {
  /**
   * Obtiene el checklist de un negocio.
   * Corresponde a: GET /checklist/:businessId
   */
  getBusinessChecklist(businessId: string) {
    return this.get<ChecklistResponse>(`checklist/${businessId}`)
  }

  /**
   * Obtiene el resumen de progreso del checklist de un negocio.
   * Corresponde a: GET /checklist/:businessId/progress
   */
  getChecklistProgress(businessId: string) {
    return this.get<ChecklistProgressResponse>(`checklist/${businessId}/progress`)
  }

  /**
   * Actualiza el estado de un item del checklist.
   * Corresponde a: PATCH /checklist/:businessId/phase/:phaseId/item/:itemId
   */
  updateChecklistItem(
    businessId: string,
    phaseId: string,
    itemId: string,
    data: UpdateChecklistItemRequest
  ) {
    return this.patch<ChecklistResponse>(
      `checklist/${businessId}/phase/${phaseId}/item/${itemId}`,
      data
    )
  }

  /**
   * Mueve al siguiente fase del checklist.
   * Corresponde a: POST /checklist/:businessId/next-phase
   */
  moveToNextPhase(businessId: string) {
    return this.post<ChecklistResponse>(`checklist/${businessId}/next-phase`, {})
  }
}

export const checklistService = new ChecklistService()