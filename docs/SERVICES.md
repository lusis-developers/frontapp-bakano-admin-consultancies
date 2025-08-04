# 📋 Documentación de Servicios

Esta documentación describe todos los servicios disponibles en la aplicación Bakano Admin.

## 🗂️ Índice de Servicios

- [AuthService](#authservice)
- [ClientService](#clientservice)
- [BusinessService](#businessservice)
- [PaymentsService](#paymentsservice)
- [HttpBase](#httpbase)

---

## 🔐 AuthService

**Archivo**: `src/services/authService.ts`

Servicio de autenticación que maneja el login, logout y verificación de sesión.

### Métodos

#### `login(credentials: LoginCredentials): Promise<LoginResponse>`

Autentica al usuario con las credenciales proporcionadas.

**Parámetros**:
- `credentials.email` (string): Email del usuario
- `credentials.password` (string): Contraseña del usuario

**Retorno**: Promise con objeto LoginResponse
```typescript
interface LoginResponse {
  token: string
  user: {
    id: number
    email: string
    name: string
  }
}
```

**Credenciales por defecto**:
- Email: `admin@bakano.ec`
- Password: `Bakano2024!`

#### `isAuthenticated(): boolean`

Verifica si el usuario está autenticado.

**Retorno**: boolean indicando si hay un token válido

#### `logout(): void`

Cierra la sesión del usuario eliminando el token del localStorage.

---

## 👥 ClientService

**Archivo**: `src/services/clientService.ts`

Servicio principal para la gestión de clientes, incluyendo operaciones CRUD, búsqueda y gestión de reuniones.

### Métodos

#### `getClientAndBusiness(clientId: string, businessId: string): Promise<ClientBusinessResponse>`

Obtiene información detallada de un cliente y su negocio específico.

**Parámetros**:
- `clientId` (string): ID del cliente
- `businessId` (string): ID del negocio

**Retorno**: Promise con objeto ClientBusinessResponse

#### `getAllClients(): Promise<any>`

Obtiene la lista completa de todos los clientes.

**Retorno**: Promise con array de clientes

#### `getClientWithDetails(clientId: string): Promise<ClientWithDetailsResponse>`

Obtiene información detallada de un cliente específico.

**Parámetros**:
- `clientId` (string): ID del cliente

#### `confirmStrategyMeeting(clientId: string, portfolioMeetingId: string): Promise<ConfirmationResponse>`

Confirma una reunión de estrategia para un cliente.

**Parámetros**:
- `clientId` (string): ID del cliente
- `portfolioMeetingId` (string): ID de la reunión de portafolio

#### `completeDataStrategyMeeting(clientId: string, dataStrategyMeetingId: string): Promise<ConfirmationResponse>`

Marca como completada una reunión de estrategia de datos.

**Parámetros**:
- `clientId` (string): ID del cliente
- `dataStrategyMeetingId` (string): ID de la reunión de estrategia de datos

#### `getClientMeetingStatus(clientId: string): Promise<AxiosResponse<IMeetingStatusResponse>>`

Obtiene el estado actual de las reuniones de un cliente.

#### `getAllMeetingsForClient(clientId: string): Promise<AxiosResponse<AllMeetingsResponse>>`

Obtiene todas las reuniones asociadas a un cliente.

#### `getUnassignedMeetings(page: number, limit: number): Promise<UnassignedMeetingsResponse>`

Obtiene reuniones que no han sido asignadas a ningún cliente.

**Parámetros**:
- `page` (number): Número de página (por defecto: 1)
- `limit` (number): Límite de resultados por página (por defecto: 5)

#### `assignMeeting(meetingId: string, clientId: string, businessId?: string): Promise<{ data: Meeting }>`

Asigna una reunión a un cliente específico.

**Parámetros**:
- `meetingId` (string): ID de la reunión
- `clientId` (string): ID del cliente
- `businessId` (string, opcional): ID del negocio

#### `search(query: string, page: number, limit: number): Promise<UnifiedSearchResponse>`

Realiza búsqueda unificada de clientes.

**Parámetros**:
- `query` (string): Término de búsqueda
- `page` (number): Número de página (por defecto: 1)
- `limit` (number): Límite de resultados por página (por defecto: 10)

#### `deleteMeeting(meetingId: string): Promise<void>`

Elimina una reunión específica.

**Parámetros**:
- `meetingId` (string): ID de la reunión a eliminar

---

## 🏢 BusinessService

**Archivo**: `src/services/businessService.ts`

Servicio para la gestión de negocios y sus administradores.

### Métodos

#### `editBusinessData(businessId: string, data: Partial<Business>): Promise<Business>`

Actualiza la información de un negocio.

**Parámetros**:
- `businessId` (string): ID del negocio
- `data` (Partial<Business>): Datos parciales a actualizar

**Retorno**: Promise con el negocio actualizado

#### `getBusinessManagers(businessId: string): Promise<{ data: IManager[] }>`

Obtiene la lista de administradores de un negocio.

**Parámetros**:
- `businessId` (string): ID del negocio

#### `addManagerToBusiness(businessId: string, managerData: Omit<IManager, '_id'>): Promise<{ data: Business }>`

Agrega un nuevo administrador a un negocio.

**Parámetros**:
- `businessId` (string): ID del negocio
- `managerData` (object): Datos del administrador sin el ID

#### `removeManagerFromBusiness(businessId: string, managerId: string): Promise<{ data: Business }>`

Elimina un administrador de un negocio.

**Parámetros**:
- `businessId` (string): ID del negocio
- `managerId` (string): ID del administrador a eliminar

#### `deleteBusiness(businessId: string): Promise<{ message: string }>`

Elimina permanentemente un negocio.

**Parámetros**:
- `businessId` (string): ID del negocio a eliminar

---

## 💳 PaymentsService

**Archivo**: `src/services/paymentsService.ts`

Servicio para gestionar pagos y transacciones.

> ⚠️ **Nota**: Este servicio está definido pero puede estar incompleto según el estado actual del proyecto.

---

## 🔧 HttpBase

**Archivo**: `src/services/httpBase.ts`

Clase base para todas las peticiones HTTP que extiende Axios.

### Funcionalidades

- Configuración centralizada de Axios
- Manejo de headers comunes
- Interceptores de peticiones y respuestas
- Manejo de errores centralizado

### Métodos Disponibles

- `get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>`
- `post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>`
- `patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>`
- `delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>`

---

## 📊 Ejemplos de Uso

### Autenticación
```typescript
import authService from '@/services/authService'

// Login
try {
  const response = await authService.login({
    email: 'admin@bakano.ec',
    password: 'Bakano2024!'
  })
  console.log('Token:', response.token)
} catch (error) {
  console.error('Error de autenticación:', error)
}

// Verificar autenticación
if (authService.isAuthenticated()) {
  console.log('Usuario autenticado')
}

// Logout
authService.logout()
```

### Gestión de Clientes
```typescript
import clientService from '@/services/clientService'

// Obtener todos los clientes
const clients = await clientService.getAllClients()

// Buscar clientes
const results = await clientService.search('Juan', 1, 10)

// Obtener detalles de un cliente
const clientDetails = await clientService.getClientWithDetails('client-id-123')

// Asignar una reunión
await clientService.assignMeeting('meeting-123', 'client-456', 'business-789')
```

### Gestión de Negocios
```typescript
import { businessService } from '@/services/businessService'

// Editar información de negocio
const updatedBusiness = await businessService.editBusinessData('business-123', {
  name: 'Nuevo Nombre',
  email: 'nuevo@email.com'
})

// Agregar administrador
const businessWithManager = await businessService.addManagerToBusiness('business-123', {
  name: 'Nuevo Admin',
  email: 'admin@email.com',
  phone: '1234567890'
})
```

## 🚨 Manejo de Errores

Todos los servicios implementan manejo de errores estándar:

- **401 Unauthorized**: Credenciales inválidas o sesión expirada
- **404 Not Found**: Recurso no encontrado
- **422 Unprocessable Entity**: Datos de entrada inválidos
- **500 Internal Server Error**: Error del servidor

### Ejemplo de manejo de errores
```typescript
try {
  const result = await clientService.getClientWithDetails('invalid-id')
} catch (error) {
  if (error.response?.status === 404) {
    console.error('Cliente no encontrado')
  } else {
    console.error('Error desconocido:', error)
  }
}
```