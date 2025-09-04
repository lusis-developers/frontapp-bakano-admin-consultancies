export interface IMvpAccount {
  _id?: string
  client: string
  mvpType: string
  active: boolean
  createdAt?: Date | string
  updatedAt?: Date | string
  accountInfo?: {
    email: string
    firstName: string
    lastName: string
    role: string
    createdAt: string
  }
  externalUserId?: string
  createdByAdmin?: boolean
  adminCreationReason?: string
}

export interface ICreateMVPAccountRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  clientId: string
  role?: string
  adminCreationReason?: string
  adminToken?: string
}

export interface ICreateMVPAccountResponse {
  message: string
  account: IMvpAccount
}

export interface IGetMVPAccountResponse {
  accounts: IMvpAccount[]
}

export interface IClientsWithMVPResponse {
  clients: string[]
}

export interface IHealthCheckResponse {
  status: string
  message: string
}