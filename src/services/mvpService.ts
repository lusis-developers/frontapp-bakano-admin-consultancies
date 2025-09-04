import APIBase from './httpBase'
import type { AxiosResponse } from 'axios'
import type { 
  IMvpAccount, 
  ICreateMVPAccountRequest, 
  ICreateMVPAccountResponse, 
  IGetMVPAccountResponse 
} from '../types/mvp.interface'

interface ChangePasswordRequest {
  clientId: string
  newPassword: string
}

class MVPService extends APIBase {
  private static instance: MVPService

  private constructor() {
    super()
  }

  public static getInstance(): MVPService {
    if (!MVPService.instance) {
      MVPService.instance = new MVPService()
    }
    return MVPService.instance
  }

  /**
   * Crea una nueva cuenta MVP (StoryBrand) para un cliente
   * @param clientId ID del cliente
   * @param requestData Datos para crear la cuenta
   * @returns Respuesta con la cuenta creada
   */
  public async createMVPAccount(
    clientId: string,
    requestData: ICreateMVPAccountRequest
  ): Promise<ICreateMVPAccountResponse> {
    const response = await this.post('storybrand-account', {
      ...requestData,
      clientId
    })
    return response.data as ICreateMVPAccountResponse
  }

  /**
   * Cambia la contraseña de una cuenta MVP
   * @param clientId ID del cliente
   * @param newPassword Nueva contraseña
   * @returns Mensaje de éxito
   */
  public async changePassword(
    clientId: string,
    newPassword: string
  ): Promise<{ message: string }> {
    const response = await this.put('storybrand-account/password', {
      clientId,
      newPassword
    })
    return response.data as { message: string }
  }

  /**
   * Elimina una cuenta MVP
   * @param clientId ID del cliente
   * @returns Mensaje de éxito
   */
  public async deleteMVPAccount(clientId: string): Promise<{ message: string }> {
    const url = `storybrand-account/${clientId}`
    const response = await this.delete(url)
    return response.data as { message: string }
  }

  /**
   * Obtiene todas las cuentas MVP para un cliente específico
   * @param clientId ID del cliente
   * @returns Lista de cuentas MVP
   */
  public async getMVPAccountForClient(clientId: string): Promise<IGetMVPAccountResponse> {
    const response = await this.get(`storybrand-account/client/${clientId}`)
    return response.data as IGetMVPAccountResponse
  }
}

export default MVPService.getInstance()