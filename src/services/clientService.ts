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
import type { Meeting } from '@/types/meeting.interface'
import type { IPagination } from '@/types/transaction.interface'

interface ClientBusinessResponse {
  client: Client
  business: Business
}

interface UnassignedMeetingsResponse {
  data: Meeting[]
  pagination: IPagination
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

  public async getUnassignedMeetings(
    page: number = 1,
    limit: number = 5,
  ): Promise<UnassignedMeetingsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })
    const response = await this.get(`client/meeting/unassigned?${params.toString()}`)
    return response.data as UnassignedMeetingsResponse
  }

  public async assignMeetingToClient(
    meetingId: string,
    clientId: string,
  ): Promise<{ data: Meeting }> {
    const response = await this.patch(`client/meetings/${meetingId}/asign`, { clientId })
    return response.data as { data: Meeting }
  }
}

export default ClientsService.getInstance()
