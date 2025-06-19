import type { Business } from './business.interface'
import type { Meeting } from './meeting.interface'

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
  nationalIdentification: string
  businesses?: Business[]
  transactions?: any[]
  meetings?: Meeting[] // Un array de objetos del tipo que acabamos de crear
}
