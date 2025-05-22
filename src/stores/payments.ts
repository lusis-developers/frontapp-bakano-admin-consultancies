import { defineStore } from 'pinia'
import { ref } from 'vue'
import paymentsService from '@/services/paymentsService'

interface PaymentsSummaryData {
  dateRange: {
    from: string | null
    to: string | null
  }
  intents: {
    totalCount: number
    totalAmount: number
    pending: {
      count: number
      amount: number
    }
    paid: {
      count: number
      amount: number
    }
  }
  confirmedPayments: {
    total: number
    totalPaidAmount: number
    withIntent: {
      count: number
      amount: number
    }
    directTransfer: {
      count: number
      amount: number
    }
  }
}

export const usePaymentsStore = defineStore('paymentsStore', () => {
  const summary = ref<PaymentsSummaryData | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchSummary = async (from?: string, to?: string) => {
    try {
      isLoading.value = true
      error.value = null

      const result = await paymentsService.getPaymentsSummary(from, to)
      if (result) {
        summary.value = result.summary
      }
    } catch (err: any) {
      error.value = err.message || 'Error al obtener el resumen de pagos'
    } finally {
      isLoading.value = false
    }
  }

  return {
    summary,
    isLoading,
    error,
    fetchSummary,
  }
})
