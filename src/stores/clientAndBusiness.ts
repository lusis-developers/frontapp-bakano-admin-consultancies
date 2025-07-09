import { defineStore } from 'pinia'
import { AxiosError } from 'axios'
import clientsService from '@/services/clientService'
import type { Client } from '@/types/client.inteface'
import type { Business } from '@/types/business.interface'
import type { IMeetingStatusResponse } from '@/types/responses/meetingConfirmationResponse.interface'
import type { Meeting } from '@/types/meeting.interface'
import { businessService } from '@/services/businessService'
import type { IManager } from '@/types/manager.interface'
import paymentsService from '@/services/paymentsService'
import type { IPagination, ITransaction } from '@/types/transaction.interface'

interface RootState {
  client: Client | null
  businesses: Business[]
  selectedBusiness: Business | null
  isLoading: boolean
  meetingStatus: IMeetingStatusResponse | null
  error: AxiosError | null
  meetingsHistory: Meeting[] | null
  transactions: ITransaction[]
  pagination: IPagination | null
  isTransactionsLoading: boolean
  transactionFilter: {
    from: string | null
    to: string | null
  }
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
    transactions: [],
    pagination: null,
    isTransactionsLoading: false,
    transactionFilter: {
      from: null,
      to: null,
    },
  }),

  actions: {
    _setClientDetails(clientData: Client) {
      const businesses = Array.isArray(clientData.businesses) ? clientData.businesses : []
      this.client = clientData
      this.businesses = businesses
    },

    async fetchClientAndBusiness(clientId: string, businessId: string): Promise<void> {
      this.isLoading = true
      this.error = null

      try {
        const { client } = await clientsService.getClientAndBusiness(clientId, businessId)

        const businesses = Array.isArray(client.businesses) ? client.businesses : []

        this.client = client
        this.businesses = businesses

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

        this.client = response.client
        this.businesses = businesses
        this.selectedBusiness = null
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
        await clientsService.confirmStrategyMeeting(this.client._id, portfolioMeetingId)

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
      this.isLoading = true
      this.error = null
      try {
        const response = await clientsService.getClientMeetingStatus(clientId)
        this.meetingStatus = response.data
      } catch (error: unknown) {
        this.error = error as AxiosError
        this.meetingStatus = null
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
        this.meetingsHistory = []
      }
    },

    async addManager(managerData: Omit<IManager, '_id'>) {
      if (!this.client?._id || !this.selectedBusiness?._id) return

      const clientId = this.client._id
      const businessId = this.selectedBusiness._id

      this.isLoading = true
      this.error = null
      try {
        await businessService.addManagerToBusiness(businessId, managerData)
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
        await businessService.removeManagerFromBusiness(businessId, managerId)
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
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async fetchTransactions(clientId: string, page: number = 1, limit: number = 10) {
      this.isTransactionsLoading = true
      try {
        const response = await paymentsService.getTransactionsByClientId(
          clientId,
          page,
          limit,
          this.transactionFilter.from,
          this.transactionFilter.to,
        )
        if (response) {
          this.transactions = response.data
          this.pagination = response.pagination
        }
      } catch (err) {
        this.error = err as AxiosError
      } finally {
        this.isTransactionsLoading = false
      }
    },

    async setTransactionFilter(
      clientId: string,
      payload: { from: string | null; to: string | null },
    ) {
      this.transactionFilter = payload
      await this.fetchTransactions(clientId, 1)
    },

    async removeTransaction(transactionId: string) {
      try {
        const success = await paymentsService.deleteTransaction(transactionId)
        if (success) {
          this.transactions = this.transactions.filter((t) => t._id !== transactionId)
          if (this.pagination) {
            this.pagination.total--
          }
          return true
        }
        return false
      } catch (err) {
        this.error = err as AxiosError
        return false
      }
    },
  },
})

export default useClientAndBusinessStore
