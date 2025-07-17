import type { BusinessTypeEnum } from '@/enums/businessType.enum'
import type { PayMethod } from '@/enums/payMethod.enum'

export interface ManualPaymentForm {
  amount: number
  description: string
  clientName: string
  email: string
  phone: string
  businessName: string
  businessType: BusinessTypeEnum | null
  bank: string
  clientId: string
  country: string
  mongoId?: string | null
  paymentMethod: PayMethod | null
}
