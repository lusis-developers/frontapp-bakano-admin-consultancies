<script setup lang="ts">
import { ref, computed } from 'vue'
import { format } from 'date-fns'
import type { ITransaction, IPagination } from '@/types/transaction.interface'

const props = defineProps({
  transactions: {
    type: Array as () => ITransaction[],
    required: true,
  },
  pagination: {
    type: Object as () => IPagination | null,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits<{
  (e: 'delete', transactionId: string): void
  (e: 'change-page', page: number): void
  (e: 'filter-change', payload: { from: string | null; to: string | null }): void
}>()

// --- Refs para estado local ---
const transactionIdToDelete = ref<string | null>(null)
const filterFrom = ref('')
const filterTo = ref('')

// --- Lógica de formato ---
const formatDate = (date: Date) => format(new Date(date), 'dd MMMM yyyy, HH:mm')
const formatCurrency = (amount: number, currency?: string) => {
  const currencyCode = currency || 'USD'
  try {
    return new Intl.NumberFormat('es-EC', { style: 'currency', currency: currencyCode }).format(amount)
  } catch (error) {
    console.warn(`Invalid currency code: ${currencyCode}`)
    return `$${amount.toFixed(2)}`
  }
}

// --- Lógica para el filtro de fecha ---
const applyFilter = () => {
  emit('filter-change', { from: filterFrom.value || null, to: filterTo.value || null })
}

const clearFilter = () => {
  filterFrom.value = ''
  filterTo.value = ''
  emit('filter-change', { from: null, to: null })
}

// --- Lógica para la paginación mejorada ---
const paginationRange = computed(() => {
  if (!props.pagination) return []
  const { page, totalPages } = props.pagination
  if (totalPages <= 1) return [1]

  const delta = 1
  const range = []

  for (let i = Math.max(2, page - delta); i <= Math.min(totalPages - 1, page + delta); i++) {
    range.push(i)
  }

  if (page - delta > 2) {
    range.unshift('...')
  }
  if (page + delta < totalPages - 1) {
    range.push('...')
  }

  range.unshift(1)
  range.push(totalPages)

  return [...new Set(range)] // Elimina duplicados de forma concisa
})

const resultRangeText = computed(() => {
  if (!props.pagination || props.pagination.total === 0) return ''
  const { page, limit, total } = props.pagination
  const start = (page - 1) * limit + 1
  const end = Math.min(page * limit, total)
  return `Mostrando ${start} - ${end} de ${total} resultados`
})

// --- Lógica de acciones del item ---
const requestDelete = (id: string) => { transactionIdToDelete.value = id }
const cancelDelete = () => { transactionIdToDelete.value = null }
const confirmDelete = () => {
  if (transactionIdToDelete.value) {
    emit('delete', transactionIdToDelete.value)
    transactionIdToDelete.value = null
  }
}

const getSourceIcon = (source: ITransaction['source']): string => {
  const icons: Record<ITransaction['source'], string> = {
    pagoplux: 'fa-solid fa-credit-card',
    transferencia_manual: 'fa-solid fa-money-bill-transfer',
    otro: 'fa-solid fa-receipt'
  }
  return icons[source] || 'fa-solid fa-receipt'
}
</script>

<template>
  <section class="card">
    <div class="card-header">
      <i class="fas fa-receipt header-icon"></i>
      <h3>Historial de Transacciones</h3>
    </div>

    <div class="filter-bar">
      <div class="filter-group">
        <label for="date-from">Desde</label>
        <input id="date-from" v-model="filterFrom" type="date" class="date-input" />
      </div>
      <div class="filter-group">
        <label for="date-to">Hasta</label>
        <input id="date-to" v-model="filterTo" type="date" class="date-input" />
      </div>
      <div class="filter-actions">
        <button @click="applyFilter" class="btn-primary">
          <i class="fas fa-filter"></i> Aplicar
        </button>
        <button @click="clearFilter" class="btn-secondary" title="Limpiar filtros">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
    
    <div v-if="isLoading" class="loading-state">
      <i class="fas fa-spinner fa-spin fa-2x"></i>
      <p>Cargando transacciones...</p>
    </div>
    
    <div v-else-if="props.transactions.length > 0">
      <ul class="transaction-list">
        <li
          v-for="tx in props.transactions"
          :key="tx._id"
          class="transaction-item"
          :class="{ 'confirming-delete': transactionIdToDelete === tx._id }"
        >
          <div class="tx-main-info">
            <div class="tx-icon">
              <i :class="getSourceIcon(tx.source)"></i>
            </div>
            <div class="tx-details">
              <span class="tx-description">{{ tx.description }}</span>
              <span class="tx-date">{{ formatDate(tx.date) }}</span>
            </div>
          </div>
          <div class="tx-amount-actions">
            <span class="tx-amount">{{ formatCurrency(tx.amount, tx.currency) }}</span>
            <div v-if="transactionIdToDelete !== tx._id" class="tx-actions">
              <button @click="requestDelete(tx._id)" class="btn-delete" aria-label="Eliminar transacción">
                <i class="fas fa-trash"></i>
              </button>
            </div>
            <div v-else class="tx-confirm-delete">
              <button @click="cancelDelete" class="btn-cancel">Cancelar</button>
              <button @click="confirmDelete" class="btn-confirm-delete">Confirmar</button>
            </div>
          </div>
        </li>
      </ul>

      <div v-if="props.pagination && props.pagination.totalPages > 1" class="pagination-footer">
        <span class="result-text">{{ resultRangeText }}</span>
        <div class="pagination-controls">
          <button @click="emit('change-page', props.pagination.page - 1)" :disabled="props.pagination.page <= 1" class="btn-pagination" aria-label="Página anterior">
            <i class="fas fa-chevron-left"></i>
          </button>
          <template v-for="(p, index) in paginationRange" :key="index">
            <span v-if="p === '...'" class="dots">...</span>
            <button v-else @click="emit('change-page', p as number)" class="btn-pagination" :class="{ active: p === props.pagination.page }" :aria-label="`Ir a la página ${p}`">
              {{ p }}
            </button>
          </template>
          <button @click="emit('change-page', props.pagination.page + 1)" :disabled="props.pagination.page >= props.pagination.totalPages" class="btn-pagination" aria-label="Página siguiente">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <i class="fas fa-search-dollar fa-2x empty-state-icon"></i>
      <p>No se encontraron transacciones</p>
      <span class="empty-state-subtitle">Intenta ajustar los filtros o selecciona otro rango de fechas.</span>
    </div>
  </section>
</template>


<style lang="scss" scoped>
@use '@/styles/index.scss' as *;

.card {
  display: flex;
  flex-direction: column;
}

.loading-state,
.empty-state {
  font-family: $font-secondary;
  text-align: center;
  color: rgba($BAKANO-DARK, 0.6);
  padding: 4rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.empty-state {
  background-color: lighten($BAKANO-LIGHT, 3%);
  border-radius: 12px;
  margin-top: 1rem;

  .empty-state-icon {
    color: darken($BAKANO-LIGHT, 15%);
  }

  .empty-state-subtitle {
    font-size: 0.9rem;
    max-width: 300px;
    line-height: 1.5;
  }
}

.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-end;
  padding-bottom: 1.5rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid $BAKANO-LIGHT;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  label {
    font-family: $font-secondary;
    font-size: 0.75rem;
    font-weight: 500;
    color: rgba($BAKANO-DARK, 0.7);
  }
}

.date-input {
  font-family: $font-secondary;
  padding: 0.5rem;
  border: 1px solid darken($BAKANO-LIGHT, 10%);
  border-radius: 6px;
  background-color: $white;
  color: $BAKANO-DARK;
  transition: border-color 0.2s;

  &:focus,
  &:hover {
    outline: none;
    border-color: $BAKANO-PURPLE;
  }
}

.filter-actions {
  display: flex;
  gap: 0.5rem;
  margin-left: auto;

  .btn-primary,
  .btn-secondary {
    padding: 0.6rem 1rem;
    font-family: $font-principal;
    font-weight: 600;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }

  .btn-primary {
    background-color: $BAKANO-PURPLE;
    color: $white;

    &:hover {
      background-color: darken($BAKANO-PURPLE, 8%);
    }
  }

  .btn-secondary {
    background-color: transparent;
    color: $BAKANO-DARK;
    border: 1px solid darken($BAKANO-LIGHT, 10%);
    padding: 0.6rem;
    width: 38px;
    height: 38px;
    justify-content: center;

    &:hover {
      background-color: $BAKANO-LIGHT;
    }
  }
}

.transaction-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
}

.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0.5rem;
  border-bottom: 1px solid $BAKANO-LIGHT;
  transition: background-color 0.2s ease;
  flex-wrap: wrap;

  &:last-child {
    border-bottom: none;
  }

  &.confirming-delete {
    background-color: lighten($BAKANO-PINK, 42%);
    border-radius: 8px;
  }
}

.tx-main-info,
.tx-amount-actions,
.tx-details,
.tx-confirm-delete {
  display: flex;
  align-items: center;
}

.tx-main-info {
  gap: 1rem;
  flex-grow: 1;
  min-width: 200px;
}

.tx-details {
  flex-direction: column;
  align-items: flex-start;
}

.tx-amount-actions {
  gap: 1rem;
  margin-left: 1rem;
}

.tx-description {
  font-family: $font-principal;
  font-weight: 600;
  color: $BAKANO-DARK;
  font-size: 0.95rem;
}

.tx-date {
  font-family: $font-secondary;
  font-size: 0.8rem;
  color: rgba($BAKANO-DARK, 0.7);
}

.tx-amount {
  font-family: $font-principal;
  font-weight: 700;
  font-size: 1rem;
  color: $BAKANO-GREEN;
  white-space: nowrap;
}

.tx-icon {
  background-color: $overlay-purple;
  color: $BAKANO-PURPLE;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  justify-content: center;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.btn-delete,
.tx-confirm-delete .btn-cancel,
.tx-confirm-delete .btn-confirm-delete {
  font-family: $font-principal;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-delete {
  background: none;
  color: rgba($BAKANO-DARK, 0.3);
  border-radius: 50%;
  width: 36px;
  height: 36px;
  font-size: 0.9rem;
  line-height: 1;

  &:hover {
    background-color: lighten($BAKANO-PINK, 40%);
    color: $BAKANO-PINK;
  }
}

.tx-confirm-delete {
  gap: 0.5rem;

  button {
    padding: 0.4rem 0.8rem;
    border-radius: 6px;
    font-weight: 600;
    font-size: 0.8rem;
  }
}

.btn-cancel {
  background-color: $BAKANO-LIGHT;
  color: $BAKANO-DARK;

  &:hover {
    background-color: darken($BAKANO-LIGHT, 10%);
  }
}

.btn-confirm-delete {
  background-color: $BAKANO-PINK;
  color: white;

  &:hover {
    background-color: darken($BAKANO-PINK, 10%);
  }
}

.pagination-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  padding-top: 1.5rem;
  margin-top: 1rem;
  border-top: 1px solid $BAKANO-LIGHT;
}

.result-text {
  font-family: $font-secondary;
  font-size: 0.85rem;
  color: rgba($BAKANO-DARK, 0.7);
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.btn-pagination,
.dots {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
}

.btn-pagination {
  background-color: $white;
  border: 1px solid $BAKANO-LIGHT;
  color: $BAKANO-DARK;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-family: $font-principal;
  transition: all 0.2s ease;

  &.active {
    background-color: $BAKANO-PURPLE;
    color: $white;
    border-color: $BAKANO-PURPLE;
  }

  &:hover:not(:disabled):not(.active) {
    border-color: $BAKANO-PURPLE;
    color: $BAKANO-PURPLE;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.dots {
  color: rgba($BAKANO-DARK, 0.5);
}

@media (max-width: 768px) {
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-actions {
    margin-left: 0;
    width: 100%;

    .btn-primary,
    .btn-secondary {
      justify-content: center;
    }
  }

  .pagination-footer {
    flex-direction: column;
    gap: 1rem;
    align-items: center;
  }
}

@media (max-width: 600px) {
  .transaction-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .tx-amount-actions {
    width: 100%;
    justify-content: space-between;
    margin-left: 0;
    padding-top: 0.75rem;
    margin-top: 0.75rem;
    border-top: 1px solid $BAKANO-LIGHT;
  }
}
</style>