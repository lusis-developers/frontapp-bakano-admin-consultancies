import type { BusinessTypeEnum } from '@/enums/businessType.enum'
import type { IManager } from './manager.interface'

export interface Business {
  _id: string
  name: string
  ruc?: string
  address?: string
  businessType: BusinessTypeEnum
  phone?: string
  email?: string
  managers?: IManager[]
  owner: string // ObjectId as string
  createdAt: Date
  updatedAt: Date
  instagram?: string
  tiktok?: string
  empleados?: string
  ingresoMensual?: string
  ingresoAnual?: string
  desafioPrincipal?: string
  objetivoIdeal?: string
  costoPorPlatoPath?: string
  menuRestaurantePath?: string | string[]
  ventasClientePath?: string
  ventasMovimientosPath?: string
  ventasProductosPath?: string
  vendePorWhatsapp?: boolean
  gananciaWhatsapp?: string
  onboardingStep: string
  dataSubmissionCompletedAt?: Date
  meetingScheduledAt?: Date
  meetingDateTime?: Date
  meetingLink?: string
  lastDataReminderSentAt?: Date
  lastScheduleMeetingReminderSentAt?: Date
  meetingReminder24hSent?: boolean
  meetingReminder1hSent?: boolean
  handoffData?: IHandoffData
  brandLogoPath?: string
  brandPrimaryColor?: string
  brandSecondaryColor?: string
  brandTypographyName?: string
  brandTypographyPath?: string
  brandUsageExamplesPath?: string
  checklistId?: string // ObjectId as string
}

export interface IHandoffData {
  _id: string
  salesSummary: string
  clientExpectations: string
  billingSegment: string
  clientExpectedOutcome: string
  handoffBy: string
  handoffDate: Date
  notes?: string
}
