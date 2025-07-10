import type { MeetingStatus, MeetingType } from '@/enums/meetingStatus.enum'

export interface Meeting {
  _id: string // En el frontend, el _id de Mongoose suele ser un string
  id: string
  client: string // El ID del cliente asociado
  assignedTo: string
  status: MeetingStatus
  meetingType: MeetingType
  scheduledTime?: string // Las fechas llegan como strings en formato ISO
  endTime?: string
  meetingLink?: string
  source: string
  sourceId: string
  createdAt: string // Mongoose añade estos campos
  updatedAt: string
  attendeeEmail?: string
  attendeePhone?: string
}
