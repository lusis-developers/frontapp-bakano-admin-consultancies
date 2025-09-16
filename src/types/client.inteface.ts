import type { Business } from './business.interface'
import type { Meeting } from './meeting.interface'
import type { ClientTypeEnum } from '@/enums/clientType.enum'

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
  clientType: ClientTypeEnum
  businesses?: Business[]
  transactions?: any[]
  meetings?: Meeting[] // Un array de objetos del tipo que acabamos de crear
}
