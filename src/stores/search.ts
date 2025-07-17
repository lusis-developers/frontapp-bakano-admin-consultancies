import { defineStore } from 'pinia'
import { ref } from 'vue'
import clientsService from '@/services/clientService'
import type { Client } from '@/types/client.inteface'
import type { IPagination } from '@/types/transaction.interface'

// La interfaz del estado se mantiene simple.
interface SearchState {
  // `displayList` es la ÚNICA lista que los componentes verán.
  displayList: Client[]
  pagination: IPagination | null
  isLoading: boolean
  error: string | null
  searchTerm: string
}

export const useSearchStore = defineStore('search', () => {
  // --- STATE ---
  const state = ref<SearchState>({
    displayList: [],
    pagination: null,
    isLoading: false,
    error: null,
    searchTerm: '',
  })

  // --- ACTIONS ---

  /**
   * @description Obtiene la lista COMPLETA de clientes y la establece como la lista visible.
   */
  const fetchAllClients = async () => {
    state.value.isLoading = true
    state.value.error = null
    try {
      // Usamos el servicio que ya existía para traer todos los clientes.
      const response = await clientsService.getAllClients()
      // Asumimos que la respuesta tiene un formato { data: Client[] }
      state.value.displayList = (response as { data: Client[] }).data
      state.value.pagination = null // La lista completa no necesita paginación en este caso.
    } catch (err: any) {
      state.value.error = err.message || 'Ocurrió un error al cargar los clientes.'
      state.value.displayList = []
    } finally {
      state.value.isLoading = false
    }
  }

  /**
   * @description Ejecuta una búsqueda contra la API y actualiza la lista visible con los resultados.
   */
  const performSearch = async (page: number = 1) => {
    state.value.isLoading = true
    state.value.error = null
    try {
      const response = await clientsService.search(state.value.searchTerm, page)
      state.value.displayList = response.data
      state.value.pagination = response.pagination
    } catch (err: any) {
      state.value.error = err.message || 'Ocurrió un error en la búsqueda.'
      state.value.displayList = []
    } finally {
      state.value.isLoading = false
    }
  }

  /**
   * @description Orquesta la lógica de búsqueda. Es el único método que los componentes deben llamar.
   */
  const executeSearch = (term: string) => {
    state.value.searchTerm = term
    if (!term.trim()) {
      // Si el término está vacío, volvemos a cargar la lista por defecto.
      fetchAllClients()
    } else {
      // Si hay un término, ejecutamos la búsqueda en la API.
      performSearch(1)
    }
  }

  const goToPage = (page: number) => {
    if (page > 0 && page <= (state.value.pagination?.totalPages || 0)) {
      performSearch(page)
    }
  }

  return {
    state,
    fetchAllClients,
    executeSearch,
    goToPage,
  }
})
