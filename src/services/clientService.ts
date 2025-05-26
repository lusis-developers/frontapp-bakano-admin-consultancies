import type { Business } from '@/types/business.interface'
import APIBase from './httpBase'
import type { ClientWithDetailsResponse } from '@/types/responses/clientWithDetailsResponse.interface'
import type { Client } from '@/types/client.inteface'

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
}

export default ClientsService.getInstance()
