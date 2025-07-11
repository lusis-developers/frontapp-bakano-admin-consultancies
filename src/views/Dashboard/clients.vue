<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { format } from 'date-fns'
import ClientsService from '@/services/clientService'

interface Client {
  _id: string
  name: string
  email: string
  phone: string
  country: string
  city: string
  dateOfBirth: string
  createdAt: string
  updatedAt: string
  paymentInfo: {
    preferredMethod: string
    lastPaymentDate: string
    cardType: string
    cardInfo: string
    bank: string
  }
}

const clients = ref<Client[]>([])
const isLoading = ref(true)

const fetchClients = async () => {
  isLoading.value = true
  try {
    const response = await ClientsService.getAllClients()
    clients.value = (response as { data: Client[] }).data
  } catch (err) {
    console.error('Error cargando clientes:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchClients()
})

const formatDate = (date: string) => format(new Date(date), 'dd MMM yyyy HH:mm')
</script>

<template>
  <div class="clients-dashboard">
    <h2 class="section-title">Últimos Clientes</h2>

    <div v-if="isLoading" class="loading">
      <i class="fas fa-spinner fa-spin"></i> Cargando clientes...
    </div>

    <div v-else-if="clients.length === 0" class="empty-state">
      No hay clientes registrados.
    </div>

    <div v-else class="clients-list">
      <div class="client-card" v-for="client in clients" :key="client._id"
       @click="$router.push(`/client/${client._id}`)"
      >
        <i class="fas fa-arrow-up-right-from-square open-link-icon"></i>

        <div class="client-info">
          <h3>{{ client.name }}</h3>
          <p><strong>Correo:</strong> {{ client.email }}</p>
          <p><strong>Teléfono:</strong> {{ client.phone }}</p>
          <p><strong>Ubicación:</strong> {{ client.city }}, {{ client.country }}</p>
        </div>
        <div class="payment-info">
          <p><strong>Último Pago:</strong> {{ formatDate(client.paymentInfo.lastPaymentDate) }}</p>
          <p><strong>Método:</strong> {{ client.paymentInfo.preferredMethod }}</p>
          <p><strong>Banco:</strong> {{ client.paymentInfo.bank }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/index.scss' as *;

.clients-dashboard {
  margin-top: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  font-size: 1.5rem;
  color: $BAKANO-DARK;
  margin-bottom: 1rem;
  font-weight: 600;
  padding: 0 1rem;
}

.loading,
.empty-state {
  text-align: center;
  font-size: 1rem;
  color: rgba($BAKANO-DARK, 0.7);
  margin-top: 1rem;

  i {
    margin-right: 0.5rem;
    color: $BAKANO-PINK;
  }
}

.clients-list {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.client-card {
  position: relative; // NUEVO: Necesario para posicionar el ícono de forma absoluta
  background: $white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba($BAKANO-PINK, 0.06);
  padding: 1.5rem;
  margin: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.3s ease;
  cursor: pointer; // NUEVO: Cambia el cursor a una mano para indicar que es clickeable

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 16px rgba($BAKANO-PINK, 0.12);

    // NUEVO: Efecto de hover sobre el ícono cuando pasamos el mouse por la tarjeta
    .open-link-icon {
      color: $BAKANO-PINK;
      transform: scale(1.1);
    }
  }

  h3 {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
    color: $BAKANO-DARK;
  }

  p {
    margin: 0.25rem 0;
    color: $BAKANO-DARK;
    font-size: 0.95rem;

    strong {
      color: $BAKANO-PURPLE;
    }
  }
}

// NUEVO: Estilos para el ícono de "abrir enlace"
.open-link-icon {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  font-size: 1rem;
  color: rgba($BAKANO-PURPLE, 0.5); // Un color sutil que no distrae
  transition: all 0.3s ease;
}

.payment-info {
  margin-top: 1rem;
  border-top: 1px solid rgba($BAKANO-DARK, 0.1);
  padding-top: 1rem;
}
</style>