import type { Business } from './business.interface'

export interface PaymentInfo {
  preferredMethod: string
  lastPaymentDate: string
  cardType: string
  cardInfo: string
  bank: string
}

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
  paymentInfo: PaymentInfo
  transactions?: string[]
  businesses?: Business[]
}
