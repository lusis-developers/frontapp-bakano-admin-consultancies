// src/stores/clientAndBusiness.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import clientsService from '@/services/clientService'

export const useClientAndBusinessStore = defineStore('clientAndBusiness', () => {
  const client = ref<any | null>(null)
  const business = ref<any | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchClientAndBusiness = async (clientId: string, businessId: string) => {
    isLoading.value = true
    error.value = null
    try {
      const data = await clientsService.getClientAndBusiness(clientId, businessId)
      client.value = data.client
      business.value = data.business
    } catch (err: any) {
      error.value = err.message || 'Error al obtener datos del cliente y negocio'
    } finally {
      isLoading.value = false
    }
  }

  return {
    client,
    business,
    isLoading,
    error,
    fetchClientAndBusiness,
  }
})
