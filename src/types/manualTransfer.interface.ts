import type { BusinessTypeEnum } from '@/enums/businessType.enum'
import type { PayMethod } from '@/enums/payMethod.enum'
import type { ClientTypeEnum } from '@/enums/clientType.enum'

export interface ManualPaymentForm {
  amount: number
  description: string
  clientName: string
  email: string
  phone: string
  businessName: string
  businessType: BusinessTypeEnum | null
  valueProposition?: string
  bank: string
  clientId: string
  country: string
  clientType: ClientTypeEnum | null
  mongoId?: string | null
  paymentMethod: PayMethod | null
}
