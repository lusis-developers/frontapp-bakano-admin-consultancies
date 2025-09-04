import { useMVPStore } from '../stores/mvp'
import { storeToRefs } from 'pinia'
import type { ICreateMVPAccountRequest } from '../types/mvp.interface'

/**
 * Composable para gestionar las cuentas MVP
 * Proporciona acceso al estado y acciones del store de MVP
 */
export function useMVP() {
  const mvpStore = useMVPStore()
  
  // Extraer estado reactivo
  const { mvpAccounts, isLoading, error } = storeToRefs(mvpStore)
  
  // Extraer acciones
  const { 
    initialize,
    fetchMVPAccountForClient, 
    createMVPAccount,
    changePassword,
    deleteMVPAccount 
  } = mvpStore
  
  return {
    // Estado
    mvpAccounts,
    isLoading,
    error,
    
    // Acciones
    initialize,
    fetchMVPAccountForClient,
    createMVPAccount,
    changePassword,
    deleteMVPAccount
  }
}