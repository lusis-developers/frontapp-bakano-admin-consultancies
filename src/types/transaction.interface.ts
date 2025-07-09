export interface ITransaction {
  _id: string
  clientId: string
  amount: number
  currency: string
  description: string
  source: 'pagoplux' | 'transferencia_manual' | 'otro'
  status: 'completado' | 'pendiente' | 'fallido'
  date: Date
  metadata?: Record<string, any>
}

export interface IPagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ITransactionApiResponse {
  data: ITransaction[]
  pagination: IPagination
}
