export interface IChecklistItem {
  id: string
  title: string
  description?: string
  completed: boolean
  completedAt?: Date
  completedBy?: string // ObjectId as string
}

export interface IChecklistPhase {
  id: string
  name: string
  items: IChecklistItem[]
  completed: boolean
  completedAt?: Date
}

export interface IChecklist {
  _id: string
  businessId: string // ObjectId as string
  phases: IChecklistPhase[]
  currentPhase: number
  createdAt: Date
  updatedAt: Date
}

// Response types for API calls
export interface ChecklistResponse {
  message: string
  checklist: IChecklist
}

export interface ChecklistProgressResponse {
  message: string
  progress: {
    totalPhases: number
    completedPhases: number
    currentPhase: number
    currentPhaseName: string
    totalItems: number
    completedItems: number
    overallProgress: number
  }
}

// Request types
export interface UpdateChecklistItemRequest {
  completed: boolean
  completedBy?: string
}