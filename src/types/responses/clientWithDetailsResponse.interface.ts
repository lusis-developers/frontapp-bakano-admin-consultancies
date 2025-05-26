import type { Business } from '../business.interface'
import type { Client } from '../client.inteface'

export interface ClientWithDetailsResponse {
  client: Client
  transactions: any[] // puedes tipar esto mejor luego
  businesses: Business[]
}
