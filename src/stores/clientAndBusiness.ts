import { defineStore } from 'pinia'
import { AxiosError } from 'axios'
import clientsService from '@/services/clientService'
import type { Client } from '@/types/client.inteface'
import type { Business } from '@/types/business.interface'
import { MeetingStatus } from '@/enums/meetingStatus.enum'
import type { IMeetingStatusResponse } from '@/types/responses/meetingConfirmationResponse.interface'
import type { Meeting } from '@/types/meeting.interface'
import { businessService } from '@/services/businessService'
import type { IManager } from '@/types/manager.interface'

interface RootState {
  client: (Client & { transactions?: any[] }) | null
  businesses: Business[]
  selectedBusiness: Business | null
  isLoading: boolean
  meetingStatus: IMeetingStatusResponse | null
  error: AxiosError | null
  meetingsHistory: Meeting[] | null
}

const useClientAndBusinessStore = defineStore('ClientAndBusinessStore', {
  state: (): RootState => ({
    client: null,
    businesses: [],
    selectedBusiness: null,
    meetingStatus: null,
    meetingsHistory: null,
    isLoading: false,
    error: null,
  }),

  actions: {
    _setClientDetails(clientData: Client) {
      const businesses = Array.isArray(clientData.businesses) ? clientData.businesses : []
      const transactions = Array.isArray(clientData.transactions) ? clientData.transactions : []
      this.client = { ...clientData, transactions }
      this.businesses = businesses
    },

    async fetchClientAndBusiness(clientId: string, businessId: string): Promise<void> {
      this.isLoading = true
      this.error = null

      try {
        const { client } = await clientsService.getClientAndBusiness(clientId, businessId)

        const businesses = Array.isArray(client.businesses) ? client.businesses : []
        const transactions = Array.isArray(client.transactions) ? client.transactions : []

        this.client = { ...client, transactions }
        this.businesses = businesses

        // ✅ Aquí seleccionamos el negocio manualmente
        this.selectedBusiness = businesses.find((b) => b._id === businessId) || null
      } catch (error: unknown) {
        this.error = error as AxiosError
      } finally {
        this.isLoading = false
      }
    },

    async fetchClientWithDetails(clientId: string): Promise<void> {
      this.isLoading = true
      this.error = null

      try {
        const response = await clientsService.getClientWithDetails(clientId)

        const businesses = Array.isArray(response.client.businesses)
          ? response.client.businesses
          : []
        const transactions = Array.isArray(response.client.transactions)
          ? response.client.transactions
          : []

        this.client = { ...response.client, transactions }
        this.businesses = businesses
        this.selectedBusiness = null // Resetea al entrar desde vista general
      } catch (error: unknown) {
        this.error = error as AxiosError
      } finally {
        this.isLoading = false
      }
    },

    setSelectedBusiness(business: Business) {
      this.selectedBusiness = business
    },

    async confirmPortfolioAccess(portfolioMeetingId: string) {
      if (!this.client) return

      this.isLoading = true
      this.error = null
      try {
        // 1. Llama al backend para ejecutar la acción de confirmar
        await clientsService.confirmStrategyMeeting(this.client._id, portfolioMeetingId)

        // 2. CORRECCIÓN: Volvemos a buscar los datos relevantes para que la UI se actualice.
        //    Llamamos a las dos acciones que nuestra vista necesita para estar al día.
        await Promise.all([
          this.fetchMeetingStatus(this.client._id),
          this.fetchMeetingsHistory(this.client._id),
        ])
      } catch (error) {
        console.error('Error al confirmar el acceso:', error)
        this.error = error as any
      } finally {
        this.isLoading = false
      }
    },

    async fetchMeetingStatus(clientId: string): Promise<void> {
      this.isLoading = true // Reutilizamos el estado de carga
      this.error = null
      try {
        const response = await clientsService.getClientMeetingStatus(clientId)
        this.meetingStatus = response.data
      } catch (error: unknown) {
        this.error = error as AxiosError
        this.meetingStatus = null // En caso de error, lo reseteamos
      } finally {
        this.isLoading = false
      }
    },

    async fetchMeetingsHistory(clientId: string): Promise<void> {
      try {
        const response = await clientsService.getAllMeetingsForClient(clientId)
        this.meetingsHistory = response.data.meetings
      } catch (error) {
        console.error('Error al obtener el historial de reuniones:', error)
        this.meetingsHistory = [] // En caso de error, dejamos un array vacío
      }
    },

    async addManager(managerData: Omit<IManager, '_id'>) {
      // Necesitamos el ID del cliente y del negocio para volver a cargar los datos.
      if (!this.client?._id || !this.selectedBusiness?._id) return

      const clientId = this.client._id
      const businessId = this.selectedBusiness._id

      this.isLoading = true
      this.error = null
      try {
        // 1. Realizamos la acción de agregar. Ya no necesitamos guardar la respuesta.
        await businessService.addManagerToBusiness(businessId, managerData)

        // 2. Si tiene éxito, volvemos a cargar toda la información fresca.
        await this.fetchClientAndBusiness(clientId, businessId)
      } catch (error) {
        console.error('Error al agregar el manager:', error)
        this.error = error as any
      } finally {
        this.isLoading = false
      }
    },

    async removeManager(managerId: string) {
      if (!this.client?._id || !this.selectedBusiness?._id || !managerId) return

      const clientId = this.client._id
      const businessId = this.selectedBusiness._id

      this.isLoading = true
      this.error = null
      try {
        // 1. Realizamos la acción de eliminar.
        await businessService.removeManagerFromBusiness(businessId, managerId)

        // 2. Si tiene éxito, volvemos a cargar toda la información fresca.
        await this.fetchClientAndBusiness(clientId, businessId)
      } catch (error) {
        console.error('Error al eliminar el manager:', error)
        this.error = error as any
      } finally {
        this.isLoading = false
      }
    },

    async updateBusinessDetails(businessData: Partial<Business>) {
      if (!this.client?._id || !this.selectedBusiness?._id) {
        throw new Error('Cliente o negocio no seleccionado.')
      }
      const clientId = this.client._id
      const businessId = this.selectedBusiness._id

      this.isLoading = true
      this.error = null
      try {
        await businessService.editBusinessData(businessId, businessData)
        await this.fetchClientAndBusiness(clientId, businessId)
      } catch (error) {
        console.error('Error al actualizar el negocio:', error)
        this.error = error as any
        throw error // Propagamos el error
      } finally {
        this.isLoading = false
      }
    },
  },
})

export default useClientAndBusinessStore
