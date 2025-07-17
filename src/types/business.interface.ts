import type { BusinessTypeEnum } from '@/enums/businessType.enum'
import type { IManager } from './manager.interface'

export interface Business {
  _id: string
  name: string
  description?: string
  address?: string
  logoUrl?: string
  category?: string
  phone?: string
  email?: string
  businessType?: BusinessTypeEnum
  website?: string
  createdAt?: string
  updatedAt?: string
  managers?: IManager[]
  [key: string]: any // extensible para props adicionales
}
