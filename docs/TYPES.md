# 📋 Documentación de Tipos e Interfaces

Documentación completa de todos los tipos TypeScript e interfaces utilizados en la aplicación Bakano Admin.

## 📊 Índice

- [Interfaces Principales](#interfaces-principales)
- [Enums](#enums)
- [Respuestas de API](#respuestas-de-api)
- [Interfaces de Negocio](#interfaces-de-negocio)
- [Interfaces de Cliente](#interfaces-de-cliente)
- [Interfaces de Reuniones](#interfaces-de-reuniones)
- [Interfaces de Transacciones](#interfaces-de-transacciones)

---

## 🔧 Interfaces Principales

### Business

**Archivo**: `src/types/business.interface.ts`

Representa un negocio en el sistema.

```typescript
interface Business {
  _id: string                    // Identificador único
  name: string                   // Nombre del negocio
  description?: string           // Descripción opcional
  address?: string               // Dirección física
  logoUrl?: string               // URL del logo
  category?: string              // Categoría del negocio
  phone?: string                 // Teléfono de contacto
  email?: string                 // Email de contacto
  businessType?: BusinessTypeEnum // Tipo de negocio
  website?: string               // Sitio web
  createdAt?: string             // Fecha de creación (ISO)
  updatedAt?: string             // Fecha de última actualización (ISO)
  managers?: IManager[]          // Lista de administradores
  [key: string]: any            // Propiedades adicionales dinámicas
}
```

### Client

**Archivo**: `src/types/client.inteface.ts`

Representa un cliente en el sistema.

```typescript
interface Client {
  _id: string                    // Identificador único
  name: string                   // Nombre completo
  email: string                  // Email principal
  phone: string                  // Teléfono de contacto
  country: string                // País
  city: string                   // Ciudad
  dateOfBirth: string            // Fecha de nacimiento (ISO)
  createdAt: string              // Fecha de registro (ISO)
  updatedAt: string              // Fecha de última actualización (ISO)
  paymentInfo: {                 // Información de pago
    preferredMethod: string       // Método preferido de pago
    lastPaymentDate: string       // Último pago (ISO)
    cardType: string              // Tipo de tarjeta
    cardInfo: string              // Información de tarjeta
    bank: string                  // Banco
  }
  nationalIdentification: string // Identificación nacional
  businesses?: Business[]         // Negocios asociados
  transactions?: any[]            // Transacciones
  meetings?: Meeting[]          // Reuniones programadas
}
```

### IManager

**Archivo**: `src/types/manager.interface.ts`

Representa un administrador de negocio.

```typescript
interface IManager {
  _id: string                    // Identificador único
  name: string                   // Nombre completo
  email: string                  // Email de contacto
  phone: string                  // Teléfono
  role: string                   // Rol en el negocio
  createdAt: string              // Fecha de asignación (ISO)
}
```

### Meeting

**Archivo**: `src/types/meeting.interface.ts`

Representa una reunión en el sistema.

```typescript
interface Meeting {
  _id: string                    // Identificador único
  type: string                   // Tipo de reunión
  status: string                 // Estado actual
  scheduledDate: string          // Fecha programada (ISO)
  clientId?: string              // ID del cliente asignado
  businessId?: string            // ID del negocio relacionado
  notes?: string                 // Notas adicionales
  createdAt: string              // Fecha de creación (ISO)
  updatedAt: string              // Fecha de última actualización (ISO)
}
```

### Transaction

**Archivo**: `src/types/transaction.interface.ts`

Representa una transacción en el sistema.

```typescript
interface Transaction {
  _id: string                    // Identificador único
  amount: number                 // Monto de la transacción
  type: string                   // Tipo de transacción
  status: string                 // Estado actual
  clientId: string               // ID del cliente
  businessId?: string            // ID del negocio (opcional)
  paymentMethod: string          // Método de pago
  createdAt: string              // Fecha de transacción (ISO)
  updatedAt: string              // Fecha de última actualización (ISO)
}
```

### IPagination

**Archivo**: `src/types/transaction.interface.ts`

Interfaz para paginación de resultados.

```typescript
interface IPagination {
  page: number                   // Página actual
  limit: number                  // Límite por página
  total: number                  // Total de elementos
  totalPages: number             // Total de páginas
  hasNext: boolean               // Si hay siguiente página
  hasPrev: boolean               // Si hay página anterior
}
```

---

## 📋 Enums

### BusinessTypeEnum

**Archivo**: `src/enums/businessType.enum.ts`

Enumera todos los tipos de negocio disponibles.

```typescript
enum BusinessTypeEnum {
  RESTAURANT = 'Restaurant',
  CAFE = 'Cafe',
  FOOD_TRUCK = 'Food Truck',
  BAR = 'Bar',
  BAKERY = 'Bakery',
  FAST_FOOD = 'Fast Food',
  CLOTHING_STORE = 'Clothing Store',
  SUPERMARKET = 'Supermarket',
  CONVENIENCE_STORE = 'Convenience Store',
  PHARMACY = 'Pharmacy',
  BOOKSTORE = 'Bookstore',
  AUTO_REPAIR = 'Auto Repair',
  CAR_WASH = 'Car Wash',
  AUTO_PARTS = 'Auto Parts',
  TIRE_SHOP = 'Tire Shop',
  SALON = 'Salon',
  SPA = 'Spa',
  BARBERSHOP = 'Barbershop',
  GYM = 'Gym',
  LAUNDRY = 'Laundry',
  PRINTING_SHOP = 'Printing Shop',
  REAL_ESTATE = 'Real Estate',
  TRAVEL_AGENCY = 'Travel Agency',
  MOVIE_THEATER = 'Movie Theater',
  ARCADE = 'Arcade',
  BOWLING_ALLEY = 'Bowling Alley',
  LAW_FIRM = 'Law Firm',
  ACCOUNTING_FIRM = 'Accounting Firm',
  CONSULTING = 'Consulting',
  TUTORING_CENTER = 'Tutoring Center',
  LANGUAGE_SCHOOL = 'Language School',
  MUSIC_SCHOOL = 'Music School',
  OTHER = 'Other'
}
```

### MeetingStatusEnum

**Archivo**: `src/enums/meetingStatus.enum.ts`

Estados posibles de una reunión.

```typescript
enum MeetingStatusEnum {
  PENDING = 'pending',
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show'
}
```

### PayMethodEnum

**Archivo**: `src/enums/payMethod.enum.ts`

Métodos de pago disponibles.

```typescript
enum PayMethodEnum {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_TRANSFER = 'bank_transfer',
  CASH = 'cash',
  PAYPAL = 'paypal',
  STRIPE = 'stripe'
}
```

---

## 🔄 Respuestas de API

### ClientWithDetailsResponse

**Archivo**: `src/types/responses/clientWithDetailsResponse.interface.ts`

Respuesta detallada de un cliente.

```typescript
interface ClientWithDetailsResponse {
  data: {
    client: Client                    // Información del cliente
    businesses: Business[]             // Negocios asociados
    transactions: Transaction[]        // Transacciones
    meetings: Meeting[]               // Reuniones
  }
  meta: {
    totalBusinesses: number           // Total de negocios
    totalTransactions: number         // Total de transacciones
    upcomingMeetings: number          // Próximas reuniones
  }
}
```

### MeetingConfirmationResponse

**Archivo**: `src/types/responses/meetingConfirmationResponse.interface.ts`

Respuestas relacionadas con confirmación de reuniones.

```typescript
// Confirmación simple
interface ConfirmationResponse {
  success: boolean                  // Éxito de la operación
  message: string                   // Mensaje descriptivo
  data?: any                        // Datos adicionales
}

// Estado de reuniones
interface IMeetingStatusResponse {
  hasPendingStrategyMeeting: boolean // Tiene reunión pendiente
  hasPendingDataStrategyMeeting: boolean // Tiene estrategia de datos pendiente
  nextMeeting?: Meeting              // Próxima reunión
  lastMeeting?: Meeting              // Última reunión
}

// Todas las reuniones de un cliente
interface AllMeetingsResponse {
  data: Meeting[]                   // Array de reuniones
  pagination: IPagination           // Información de paginación
}
```

### ManualTransferInterface

**Archivo**: `src/types/manualTransfer.interface.ts`

Representa una transferencia manual.

```typescript
interface ManualTransfer {
  _id: string                        // Identificador único
  amount: number                    // Monto a transferir
  fromAccount: string               // Cuenta origen
  toAccount: string                // Cuenta destino
  status: 'pending' | 'completed' | 'failed' // Estado
  description?: string             // Descripción
  createdAt: string                // Fecha de creación (ISO)
  updatedAt: string                // Fecha de actualización (ISO)
}
```

---

## 🎯 Ejemplos de Uso

### Trabajando con BusinessTypeEnum

```typescript
import { BusinessTypeEnum } from '@/enums/businessType.enum'

// Asignar tipo de negocio
const business: Business = {
  name: 'Mi Restaurante',
  businessType: BusinessTypeEnum.RESTAURANT,
  // ... otros campos
}

// Verificar tipo
if (business.businessType === BusinessTypeEnum.CAFE) {
  console.log('Es una cafetería')
}

// Obtener todos los tipos
const allTypes = Object.values(BusinessTypeEnum)
```

### Creando objetos con interfaces

```typescript
// Crear cliente
const newClient: Client = {
  name: 'Juan Pérez',
  email: 'juan@email.com',
  phone: '+593991234567',
  country: 'Ecuador',
  city: 'Quito',
  dateOfBirth: '1990-01-15',
  nationalIdentification: '1712345678',
  paymentInfo: {
    preferredMethod: 'credit_card',
    lastPaymentDate: new Date().toISOString(),
    cardType: 'Visa',
    cardInfo: '****1234',
    bank: 'Banco Pichincha'
  }
}

// Crear negocio
const newBusiness: Business = {
  name: 'Café Central',
  businessType: BusinessTypeEnum.CAFE,
  email: 'contacto@cafecentral.com',
  phone: '+5932223456',
  address: 'Av. Amazonas 123',
  description: 'El mejor café de la ciudad'
}
```

### Trabajando con respuestas de API

```typescript
// Procesar respuesta de cliente con detalles
const processClientDetails = async (clientId: string) => {
  try {
    const response: ClientWithDetailsResponse = 
      await clientService.getClientWithDetails(clientId)
    
    const { client, businesses, transactions } = response.data
    
    console.log(`Cliente: ${client.name}`)
    console.log(`Negocios: ${businesses.length}`)
    console.log(`Transacciones: ${transactions.length}`)
    
    return {
      client,
      summary: {
        totalBusinesses: response.meta.totalBusinesses,
        totalTransactions: response.meta.totalTransactions
      }
    }
  } catch (error) {
    console.error('Error al obtener detalles:', error)
  }
}
```

---

## 🔍 Validaciones

### Validación de BusinessType

```typescript
const isValidBusinessType = (type: string): boolean => {
  return Object.values(BusinessTypeEnum).includes(type as BusinessTypeEnum)
}

// Uso
if (!isValidBusinessType(businessData.businessType)) {
  throw new Error('Tipo de negocio inválido')
}
```

### Validación de Email

```typescript
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validar cliente
const validateClient = (client: Partial<Client>): boolean => {
  if (!client.email || !isValidEmail(client.email)) {
    return false
  }
  if (!client.phone || client.phone.length < 10) {
    return false
  }
  return true
}
```

---

## 📝 Notas de Implementación

1. **Fechas**: Todas las fechas se manejan en formato ISO 8601
2. **IDs**: Los IDs son strings generados por MongoDB
3. **Campos opcionales**: Marcados con `?` en TypeScript
4. **Extensibilidad**: Las interfaces principales permiten propiedades adicionales con `[key: string]: any`
5. **Validación**: Usar Vee-Validate + Yup para validación en formularios
6. **Null safety**: Siempre verificar campos opcionales antes de usarlos