import type { Meeting } from '../meeting.interface'

export interface ConfirmationResponse {
  message: string
  strategyMeeting: Meeting | null
}

export interface IMeetingStatusResponse {
  hasScheduledMeeting: boolean
  meeting?: Meeting // El objeto de la reunión es opcional, solo vendrá si hasScheduledMeeting es true
  message?: string // Un mensaje opcional, útil si no hay reuniones
}

export interface AllMeetingsResponse {
  message: string
  meetings: Meeting[] // Es un array que contiene objetos de tipo Meeting
}
