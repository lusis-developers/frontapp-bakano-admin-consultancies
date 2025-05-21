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
}

export default PaymentsService.getInstance()
