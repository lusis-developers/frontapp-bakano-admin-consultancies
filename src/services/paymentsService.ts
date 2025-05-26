import type { ManualTransferForm } from '@/types/manualTransfer.interface'
import APIBase from './httpBase'

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

  public async registerManualTransfer(data: ManualTransferForm) {
    return await this.post('payments/manual-transfer', data)
  }
}

export default PaymentsService.getInstance()
