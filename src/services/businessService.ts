import type { IManager } from '@/types/manager.interface'
import APIBase from './httpBase'
import type { Business } from '@/types/business.interface'

class BusinessService extends APIBase {
  /**
   * Edita los datos de un negocio.
   * Corresponde a: PATCH /business/edit/:businessId
   */
  editBusinessData(businessId: string, data: Partial<Business>) {
    return this.patch<Business>(`business/edit/${businessId}`, data)
  }

  /**
   * Obtiene la lista de todos los administradores de un negocio.
   * Corresponde a: GET /business/:businessId/managers
   */
  getBusinessManagers(businessId: string) {
    // Asumimos que la respuesta tiene un formato { data: IManager[] }
    return this.get<{ data: IManager[] }>(`business/${businessId}/managers`)
  }

  /**
   * Agrega un nuevo administrador a un negocio.
   * Corresponde a: POST /business/:businessId/managers
   */
  addManagerToBusiness(businessId: string, managerData: Omit<IManager, '_id'>) {
    // La respuesta del backend devuelve el objeto de negocio actualizado
    return this.post<{ data: Business }>(`business/${businessId}/managers`, managerData)
  }

  /**
   * Elimina un administrador de un negocio.
   * Corresponde a: DELETE /business/:businessId/managers/:managerId
   */
  removeManagerFromBusiness(businessId: string, managerId: string) {
    // La respuesta del backend devuelve el objeto de negocio actualizado
    return this.delete<{ data: Business }>(`business/${businessId}/managers/${managerId}`)
  }
}

export const businessService = new BusinessService()
