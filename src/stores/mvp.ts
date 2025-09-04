import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AxiosError } from 'axios'
import mvpService from '../services/mvpService'
import type { IMvpAccount, ICreateMVPAccountRequest } from '../types/mvp.interface'

export const useMVPStore = defineStore('mvpStore', () => {
  // Estado
  const mvpAccounts = ref<IMvpAccount[]>([])
  const isLoading = ref(false)
  const error = ref<string | AxiosError | null>(null)

  // Acciones
  const initialize = async () => {
    mvpAccounts.value = []
    error.value = null
  }

  /**
   * Obtiene las cuentas MVP para un cliente específico
   * @param clientId ID del cliente
   */
  const fetchMVPAccountForClient = async (clientId: string) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await mvpService.getMVPAccountForClient(clientId)
      mvpAccounts.value = response.accounts
    } catch (err: any) {
      console.error('Error al obtener cuentas MVP:', err)
      error.value = err
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Crea una nueva cuenta MVP para un cliente
   * @param clientId ID del cliente
   * @param requestData Datos para crear la cuenta
   * @returns La cuenta creada
   */
  const createMVPAccount = async (clientId: string, requestData: ICreateMVPAccountRequest) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await mvpService.createMVPAccount(clientId, requestData)
      // Añadir la nueva cuenta a la lista
      mvpAccounts.value.push(response.account)
      return response.account
    } catch (err: any) {
      console.error('Error al crear cuenta MVP:', err)
      error.value = err
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Cambia la contraseña de una cuenta MVP
   * @param clientId ID del cliente
   * @param newPassword Nueva contraseña
   */
  const changePassword = async (clientId: string, newPassword: string) => {
    isLoading.value = true
    error.value = null

    try {
      await mvpService.changePassword(clientId, newPassword)
      return true
    } catch (err: any) {
      console.error('Error al cambiar contraseña:', err)
      error.value = err
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Elimina una cuenta MVP
   * @param clientId ID del cliente
   */
  const deleteMVPAccount = async (clientId: string) => {
    isLoading.value = true
    error.value = null

    try {
      await mvpService.deleteMVPAccount(clientId)
      // Eliminar todas las cuentas del cliente
      mvpAccounts.value = []
      return true
    } catch (err: any) {
      console.error('Error al eliminar cuenta MVP:', err)
      error.value = err
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    mvpAccounts,
    isLoading,
    error,
    initialize,
    fetchMVPAccountForClient,
    createMVPAccount,
    changePassword,
    deleteMVPAccount
  }
})