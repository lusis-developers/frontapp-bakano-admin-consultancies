import { defineStore } from 'pinia'
import { AxiosError } from 'axios'
import clientsService from '@/services/clientService'
import type { Client } from '@/types/client.inteface'
import type { Business } from '@/types/business.interface'

interface RootState {
  client: (Client & { transactions?: any[]; businesses?: Business[] }) | null
  business: Business | null
  isLoading: boolean
  error: AxiosError | null
}

const useClientAndBusinessStore = defineStore('ClientAndBusinessStore', {
  state: (): RootState => ({
    client: null,
    business: null,
    isLoading: false,
    error: null,
  }),

  actions: {
    async fetchClientAndBusiness(clientId: string, businessId: string): Promise<void> {
      this.isLoading = true
      this.error = null
      try {
        const { client, business } = await clientsService.getClientAndBusiness(clientId, businessId)
        this.client = client
        this.business = business
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
        this.client = {
          ...response.client,
          businesses: response.client.businesses || [],
          transactions: response.client.transactions || [],
        }
      } catch (error: unknown) {
        this.error = error as AxiosError
      } finally {
        this.isLoading = false
      }
    },
  },
})

export default useClientAndBusinessStore
