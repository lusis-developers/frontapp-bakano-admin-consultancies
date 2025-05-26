import type { Business } from './business.interface'

export interface Client {
  _id: string
  name: string
  email: string
  phone: string
  country: string
  city: string
  dateOfBirth: string
  createdAt: string
  updatedAt: string
  paymentInfo: {
    preferredMethod: string
    lastPaymentDate: string
    cardType: string
    cardInfo: string
    bank: string
  }
  // ✅ Nuevas propiedades opcionales
  businesses?: Business[]
  transactions?: any[]
}
