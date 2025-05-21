import APIBase from './httpBase'

interface LoginCredentials {
  email: string
  password: string
}

interface LoginResponse {
  token: string
  user: {
    id: number
    email: string
    name: string
  }
}

class AuthService extends APIBase {
  private static instance: AuthService
  private readonly ADMIN_EMAIL = 'admin@bakano.ec'
  private readonly ADMIN_PASSWORD = 'Bakano2024!'

  private constructor() {
    super()
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  public async login(credentials: LoginCredentials): Promise<LoginResponse> {
    // Validación local para el usuario admin
    if (
      credentials.email === this.ADMIN_EMAIL &&
      credentials.password === this.ADMIN_PASSWORD
    ) {
      const mockResponse: LoginResponse = {
        token: 'mock-jwt-token',
        user: {
          id: 1,
          email: this.ADMIN_EMAIL,
          name: 'Administrador'
        }
      }
      return mockResponse
    }

    throw {
      status: 401,
      message: 'Credenciales inválidas'
    }
  }

  public isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token')
  }

  public logout(): void {
    localStorage.removeItem('access_token')
  }
}

export default AuthService.getInstance()
