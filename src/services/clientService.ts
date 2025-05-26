import type { Business } from '@/types/business.interface'
import APIBase from './httpBase'
import type { ClientWithDetailsResponse } from '@/types/responses/clientWithDetailsResponse.interface'

interface ClientBusinessResponse {
  client: {
    _id: string
    name: string
    email: string
    phone: string
    country: string
    city: string
    dateOfBirth: string
    createdAt: string
    updatedAt: string
    paymentInfo: {
      preferredMethod: string
      lastPaymentDate: string
      cardType: string
      cardInfo: string
      bank: string
    }
  }
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
    const response = await this.get(`/client/${clientId}/business/${businessId}`)
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
