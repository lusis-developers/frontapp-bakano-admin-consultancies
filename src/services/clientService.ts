import type { Business } from '@/types/business.interface'
import APIBase from './httpBase'
import type { ClientWithDetailsResponse } from '@/types/responses/clientWithDetailsResponse.interface'
import type { Client } from '@/types/client.inteface'
import type {
  AllMeetingsResponse,
  ConfirmationResponse,
  IMeetingStatusResponse,
} from '@/types/responses/meetingConfirmationResponse.interface'
import type { AxiosResponse } from 'axios'

interface ClientBusinessResponse {
  client: Client
  business: Business
}

class ClientsService extends APIBase {
  private static instance: ClientsService

  private constructor() {
    super()
  }

  public static getInstance(): ClientsService {
    if (!ClientsService.instance) {
      ClientsService.instance = new ClientsService()
    }
    return ClientsService.instance
  }

  public async getClientAndBusiness(
    clientId: string,
    businessId: string,
  ): Promise<ClientBusinessResponse> {
    const response = await this.get(`client/${clientId}/business/${businessId}`)
    return response.data as ClientBusinessResponse
  }

  public async getAllClients() {
    const response = await this.get('clients')
    return response.data
  }

  public async getClientWithDetails(clientId: string): Promise<ClientWithDetailsResponse> {
    const response = await this.get(`client/${clientId}`)
    return response.data as ClientWithDetailsResponse
  }

  public async confirmStrategyMeeting(
    clientId: string,
    portfolioMeetingId: string,
  ): Promise<ConfirmationResponse> {
    const response = await this.post(`client/${clientId}/confirm-strategy-meeting`, {
      portfolioMeetingId: portfolioMeetingId,
    })
    return response.data as ConfirmationResponse
  }

  public async getClientMeetingStatus(
    clientId: string,
  ): Promise<AxiosResponse<IMeetingStatusResponse>> {
    // Usamos la nueva ruta que SÍ nos da los detalles de la reunión
    return this.get<IMeetingStatusResponse>(`clients/${clientId}/meeting-status`)
  }

  public async getAllMeetingsForClient(
    clientId: string,
  ): Promise<AxiosResponse<AllMeetingsResponse>> {
    return this.get<AllMeetingsResponse>(`client/${clientId}/all-meetings`)
  }
}

export default ClientsService.getInstance()
