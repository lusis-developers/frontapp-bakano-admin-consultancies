// 1. Servicio para obtener el cliente y negocio desde el backend
// src/services/clientsService.ts
import APIBase from './httpBase'

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
  business: Record<string, any> // puedes tiparlo mejor luego
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
}

export default ClientsService.getInstance()
