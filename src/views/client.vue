<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { format } from 'date-fns'
import useClientAndBusinessStore from '@/stores/clientAndBusiness'

const route = useRoute()
const router = useRouter()
const clientId = route.params.clientId as string

const store = useClientAndBusinessStore()

// Variable para el feedback visual, funciona igual que antes
const copiedField = ref<string | null>(null)

onMounted(async () => {
  await store.fetchClientWithDetails(clientId)
})

const formatDate = (date?: string) =>
  date ? format(new Date(date), 'dd MMM HH:mm') : 'No disponible'

// La lógica para copiar no necesita cambios
const copyToClipboard = async (textToCopy: string, fieldName: string) => {
  if (!textToCopy) return

  try {
    await navigator.clipboard.writeText(textToCopy)
    copiedField.value = fieldName
    setTimeout(() => {
      copiedField.value = null
    }, 2000)
  } catch (err) {
    console.error('Error al copiar:', err)
  }
}

const goToAllBusinesses = () => {
  router.push({ name: 'businesses', params: { clientId } })
}
</script>

<template>
  <div class="client-view">
    <h1 class="page-title">Detalles del Cliente</h1>

    <div v-if="store.isLoading" class="loading">
      <i class="fas fa-spinner fa-spin"></i> Cargando datos del cliente...
    </div>

    <div v-else-if="store.error" class="error">
      <p>Error: {{ store.error.message }}</p>
    </div>

    <div v-else-if="store.client" class="client-details">
      <section class="card">
        <h2>{{ store.client.name }}</h2>
        <p>
          <strong>Correo:</strong>
          <span class="copyable-text" @click="copyToClipboard(store.client.email, 'email')">
            <span v-if="copiedField === 'email'" class="copy-feedback">¡Correo copiado!</span>
            <span v-else>
              {{ store.client.email }}
              <i class="fas fa-copy copy-icon"></i>
            </span>
          </span>
        </p>

        <p>
          <strong>Teléfono:</strong>
          <span class="copyable-text" @click="copyToClipboard(store.client.phone, 'phone')">
            <span v-if="copiedField === 'phone'" class="copy-feedback">¡Teléfono copiado!</span>
            <span v-else>
              {{ store.client.phone }}
              <i class="fas fa-copy copy-icon"></i>
            </span>
          </span>
        </p>
        <p><strong>Ubicación:</strong> {{ store.client.city }}, {{ store.client.country }}</p>
        <p><strong>Último Pago:</strong> {{ formatDate(store.client.paymentInfo?.lastPaymentDate) }}</p>
        <p><strong>Método de Pago:</strong> {{ store.client.paymentInfo?.preferredMethod }}</p>
        <p><strong>Banco:</strong> {{ store.client.paymentInfo?.bank }}</p>
      </section>

      <section v-if="store.businesses?.length" class="card">
        <h3>Último Negocio Registrado</h3>
        <div class="business-summary">
          <h4>{{ store.businesses.at(-1)?.name }}</h4>
          <p><strong>RUC:</strong> {{ store.businesses.at(-1)?.ruc }}</p>
          <p><strong>Teléfono:</strong> {{ store.businesses.at(-1)?.phone }}</p>
          <p><strong>Dirección:</strong> {{ store.businesses.at(-1)?.address }}</p>
          <p><strong>Categoría:</strong> {{ store.businesses.at(-1)?.category || 'No especificada' }}</p>
          <button @click="goToAllBusinesses" class="view-all-button">Ver todos los negocios</button>
        </div>
      </section>

      <section v-if="store.client.transactions?.length" class="card">
        <h3>Transacciones</h3>
        <ul>
          <li v-for="tx in store.client.transactions" :key="tx._id || tx">
            ID: {{ tx.transactionId || tx }} | Monto: ${{ tx.amount }} | {{ formatDate(tx.date) }}
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/index.scss' as *;

.client-view {
  padding: 2rem;
  max-width: 960px;
  margin: 0 auto;
}

.page-title {
  font-size: 2rem;
  margin-bottom: 1.5rem;
  color: $BAKANO-DARK;
}

.loading,
.error {
  text-align: center;
  font-size: 1rem;
  color: $BAKANO-PINK;
}

.card {
  background: $white;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba($BAKANO-PINK, 0.08);

  h2,
  h3 {
    margin-bottom: 1rem;
    color: $BAKANO-PURPLE;
  }

  p,
  li {
    margin: 0.5rem 0; // Aumentamos un poco el margen para que no se vea tan apretado
    color: $BAKANO-DARK;
    line-height: 1.6;
  }

  ul {
    list-style: disc;
    padding-left: 1.5rem;
  }
}

// NUEVOS ESTILOS para el texto copiable
.copyable-text {
  display: inline-block;
  position: relative;
  cursor: pointer;
  padding: 0.2rem 0.5rem;
  margin-left: 0.5rem;
  border-radius: 6px;
  transition: all 0.25s ease-out;

  .copy-icon {
    margin-left: 0.5rem;
    color: rgba($BAKANO-PURPLE, 0.5);
    opacity: 0; // El ícono está oculto por defecto
    transition: opacity 0.2s ease-out;
    font-size: 0.85em;
  }

  &:hover {
    background-color: rgba($BAKANO-PINK, 0.08);
    color: $BAKANO-PINK;

    .copy-icon {
      opacity: 1; // Aparece al hacer hover
    }
  }
}

.copy-feedback {
  color: $BAKANO-PINK;
  font-weight: 600;
  font-size: 0.9em;
}

.business-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.2rem;
}

.business-card {
  background: $BAKANO-LIGHT;
  border: 2px solid $BAKANO-PURPLE;
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba($BAKANO-PURPLE, 0.2);
  }

  h4 {
    margin-bottom: 0.5rem;
    color: $BAKANO-DARK;
  }

  .links {
    margin-top: 1rem;

    a {
      color: $BAKANO-PINK;
      font-weight: 500;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}

.view-all-button {
  margin-top: 1rem;
  background-color: $BAKANO-PINK;
  color: $white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;

  &:hover {
    background-color: darken($BAKANO-PINK, 10%);
  }
}
</style>