import type { ManualPaymentForm } from '@/types/manualTransfer.interface'
import APIBase from './httpBase'
import type { ITransactionApiResponse } from '@/types/transaction.interface'

interface PagopluxPaymentRequest {
  monto: number
  descripcion: string
  nombreCliente: string
  correoCliente: string
  telefono: string
  nombreNegocio: string
  prefijo: string
  direccion: string
  ci: string
}

interface PagopluxPaymentResponse {
  success: boolean
  url?: string
  intentId?: string
  error?: string
}

interface PaymentsSummary {
  summary: {
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
}

class PaymentsService extends APIBase {
  private static instance: PaymentsService

  private constructor() {
    super()
  }

  public static getInstance(): PaymentsService {
    if (!PaymentsService.instance) {
      PaymentsService.instance = new PaymentsService()
    }
    return PaymentsService.instance
  }

  public async generatePagopluxPaymentLink(
    data: PagopluxPaymentRequest,
  ): Promise<PagopluxPaymentResponse> {
    try {
      const response = await this.post('pagoplux/generate-payment-link', data)
      return {
        success: true,
        url: (response.data as { url: string }).url,
        intentId: (response.data as { intentId: string }).intentId,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Error al generar el enlace de pago',
      }
    }
  }

  public async getPaymentsSummary(from?: string, to?: string): Promise<PaymentsSummary | null> {
    try {
      const params = new URLSearchParams()
      if (from) params.append('from', from)
      if (to) params.append('to', to)

      const response = await this.get(`payments/summary?${params.toString()}`)
      return response.data as PaymentsSummary
    } catch (error) {
      console.error('[getPaymentsSummary] Error:', error)
      return null
    }
  }

  public async registerManualTransfer(data: ManualPaymentForm) {
    return await this.post('webhook/receive-payment', data)
  }

  /**
   * Obtiene una lista paginada de transacciones para un cliente específico.
   * @param clientId - El ID del cliente.
   * @param page - El número de página a solicitar.
   * @param limit - El número de resultados por página.
   * @returns Una promesa que resuelve a un objeto con datos de transacciones y paginación.
   */
  public async getTransactionsByClientId(
    clientId: string,
    page: number = 1,
    limit: number = 10,
    from?: string | null,
    to?: string | null,
  ): Promise<ITransactionApiResponse | null> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })

      if (from) params.append('from', from)
      if (to) params.append('to', to)

      const response = await this.get(`clients/${clientId}/transactions?${params.toString()}`)
      return response.data as ITransactionApiResponse
    } catch (error) {
      console.error('[getTransactionsByClientId] Error:', error)
      return null
    }
  }

  /**
   * Elimina una transacción por su ID.
   * @param transactionId - El ID de la transacción a eliminar.
   * @returns Una promesa que resuelve a un booleano indicando el éxito.
   */
  public async deleteTransaction(transactionId: string): Promise<boolean> {
    try {
      await this.delete(`transactions/${transactionId}`)
      return true
    } catch (error) {
      console.error('[deleteTransaction] Error:', error)
      return false
    }
  }
}

export default PaymentsService.getInstance()
