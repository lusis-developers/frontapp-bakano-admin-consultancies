import { defineStore } from 'pinia'
import { AxiosError } from 'axios'
import clientsService from '@/services/clientService'
import type { Client } from '@/types/client.inteface'
import type { Business } from '@/types/business.interface'

interface RootState {
  client: (Client & { transactions?: any[] }) | null
  businesses: Business[]
  selectedBusiness: Business | null
  isLoading: boolean
  error: AxiosError | null
}

const useClientAndBusinessStore = defineStore('ClientAndBusinessStore', {
  state: (): RootState => ({
    client: null,
    businesses: [],
    selectedBusiness: null,
    isLoading: false,
    error: null,
  }),

  actions: {
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
  },
})

export default useClientAndBusinessStore
