<script setup lang="ts">
import { onMounted, ref } from 'vue' // Se importa 'ref'
import { useRoute } from 'vue-router'
import { format } from 'date-fns'
import useClientAndBusinessStore from '@/stores/clientAndBusiness'

const route = useRoute()
const clientId = route.params.clientId as string
const businessId = route.params.businessId as string

const store = useClientAndBusinessStore()

// --- INICIO: LÓGICA PARA COPIAR ---
const copiedField = ref<string | null>(null)

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
// --- FIN: LÓGICA PARA COPIAR ---

onMounted(async () => {
  await store.fetchClientAndBusiness(clientId, businessId)
})

const formatDate = (date?: string) =>
  date ? format(new Date(date), 'dd MMM yyyy HH:mm') : 'No disponible'
</script>

<template>
  <div class="business-details-view">
    <h1 class="page-title">Detalles del Negocio</h1>

    <div v-if="store.isLoading" class="loading">
      <i class="fas fa-spinner fa-spin"></i> Cargando información del negocio...
    </div>

    <div v-else-if="store.error" class="error">
      <p>Error: {{ store.error.message }}</p>
    </div>

    <div v-else-if="store.selectedBusiness" class="business-card">
      <h2>{{ store.selectedBusiness.name }}</h2>

      <p>
        <strong>RUC:</strong>
        <span class="copyable-text" @click="copyToClipboard(store.selectedBusiness.ruc, 'ruc')">
          <span v-if="copiedField === 'ruc'" class="copy-feedback">¡RUC copiado!</span>
          <span v-else>
            {{ store.selectedBusiness.ruc }}
            <i class="fas fa-copy copy-icon"></i>
          </span>
        </span>
      </p>
      <p>
        <strong>Teléfono:</strong>
        <span class="copyable-text" @click="copyToClipboard(store.selectedBusiness.phone!, 'phone')">
          <span v-if="copiedField === 'phone'" class="copy-feedback">¡Teléfono copiado!</span>
          <span v-else>
            {{ store.selectedBusiness.phone }}
            <i class="fas fa-copy copy-icon"></i>
          </span>
        </span>
      </p>
      <p>
        <strong>Email:</strong>
        <span class="copyable-text" @click="copyToClipboard(store.selectedBusiness.email!, 'email')">
          <span v-if="copiedField === 'email'" class="copy-feedback">¡Email copiado!</span>
          <span v-else>
            {{ store.selectedBusiness.email }}
            <i class="fas fa-copy copy-icon"></i>
          </span>
        </span>
      </p>
      <p>
        <strong>Dirección:</strong>
        <span class="copyable-text" @click="copyToClipboard(store.selectedBusiness.address!, 'address')">
          <span v-if="copiedField === 'address'" class="copy-feedback">¡Dirección copiada!</span>
          <span v-else>
            {{ store.selectedBusiness.address }}
            <i class="fas fa-copy copy-icon"></i>
          </span>
        </span>
      </p>
      <p><strong>Categoría:</strong> {{ store.selectedBusiness.category || 'No especificada' }}</p>
      <p><strong>Objetivo:</strong> {{ store.selectedBusiness.objetivoIdeal || 'No especificado' }}</p>
      <p><strong>Desafío Principal:</strong> {{ store.selectedBusiness.desafioPrincipal || 'No especificado' }}</p>

      <div class="links">
        <h3>Archivos Adjuntos</h3>
        <ul>
          <li v-if="store.selectedBusiness.menuRestaurantePath">
            <a :href="store.selectedBusiness.menuRestaurantePath" target="_blank">📋 Menú</a>
          </li>
          <li v-if="store.selectedBusiness.costoPorPlatoPath">
            <a :href="store.selectedBusiness.costoPorPlatoPath" target="_blank">💰 Costos</a>
          </li>
          <li v-if="store.selectedBusiness.ventasClientePath">
            <a :href="store.selectedBusiness.ventasClientePath" target="_blank">📊 Ventas Cliente</a>
          </li>
          <li v-if="store.selectedBusiness.ventasMovimientosPath">
            <a :href="store.selectedBusiness.ventasMovimientosPath" target="_blank">📈 Movimientos</a>
          </li>
          <li v-if="store.selectedBusiness.ventasProductosPath">
            <a :href="store.selectedBusiness.ventasProductosPath" target="_blank">🧾 Productos</a>
          </li>
          <li
            v-if="!store.selectedBusiness.menuRestaurantePath &&
              !store.selectedBusiness.costoPorPlatoPath &&
              !store.selectedBusiness.ventasClientePath &&
              !store.selectedBusiness.ventasMovimientosPath &&
              !store.selectedBusiness.ventasProductosPath"
          >
            No hay archivos subidos aún.
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/index.scss' as *;

.business-details-view {
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
  font-family: $font-principal;

  .page-title {
    font-size: 2rem;
    margin-bottom: 1.5rem;
    color: $BAKANO-DARK;
    font-weight: 600;
  }

  .loading {
    text-align: center;
    font-size: 1rem;
    color: $BAKANO-PINK;
    margin-top: 2rem;

    i {
      margin-right: 0.5rem;
    }
  }

  .error {
    color: $BAKANO-PINK;
    text-align: center;
    margin-top: 1rem;
  }
}

.business-card {
  background: $white;
  border: 2px solid $BAKANO-PURPLE;
  border-radius: 12px;
  padding: 1.5rem 2rem; // Un poco más de padding horizontal
  box-shadow: 0 4px 12px rgba($BAKANO-PURPLE, 0.1);

  h2 {
    color: $BAKANO-DARK;
    margin-bottom: 1rem;
  }

  p {
    margin: 0.5rem 0;
    font-size: 0.95rem;
    color: $BAKANO-DARK;
    line-height: 1.6; // Mejora la legibilidad

    strong {
      color: $BAKANO-PURPLE;
      margin-right: 0.5rem; // Espacio entre label y valor
    }
  }

  .links {
    margin-top: 1.5rem;
    border-top: 1px solid rgba($BAKANO-DARK, 0.1); // Separador visual
    padding-top: 1.5rem;

    h3 {
      margin-bottom: 0.5rem;
      color: $BAKANO-PINK;
      font-size: 1.1rem;
    }

    ul {
      list-style: none;
      padding: 0;

      li {
        margin: 0.3rem 0;

        a {
          text-decoration: none;
          color: $BAKANO-PURPLE;
          font-weight: 500;

          &:hover {
            text-decoration: underline;
          }
        }
      }
    }
  }
}

// --- INICIO: ESTILOS PARA COPIAR ---
.copyable-text {
  display: inline-block;
  position: relative;
  cursor: pointer;
  padding: 0.2rem 0.5rem;
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

// --- FIN: ESTILOS PARA COPIAR ---</style>