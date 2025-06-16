import type { PayMethod } from '@/enums/payMethod.enum'

export interface ManualPaymentForm {
  amount: number
  description: string
  clientName: string
  email: string
  phone: string
  businessName: string
  bank: string
  clientId: string
  country: string
  mongoId?: string
  paymentMethod: PayMethod | null
}
