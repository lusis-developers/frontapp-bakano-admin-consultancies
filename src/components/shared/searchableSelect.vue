<script setup lang="ts" generic="T extends { [key: string]: any }">
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  modelValue: string | number | null
  searchFunction: (query: string) => T[]
  labelField: keyof T
  valueField: keyof T
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number | null): void
  (e: 'select', item: T | null): void
}>()

const searchTerm = ref('')
const results = ref<T[]>([])
const isOpen = ref(false)
const container = ref<HTMLElement | null>(null)

// La búsqueda es instantánea en el frontend, no se necesita 'debounce'.
watch(searchTerm, (newTerm) => {
  if (newTerm.length > 0) {
    results.value = props.searchFunction(newTerm)
  } else {
    results.value = []
  }
})

const selectItem = (item: T) => {
  const value = item[props.valueField] as string | number
  const label = item[props.labelField] as string
  searchTerm.value = label
  isOpen.value = false
  emit('update:modelValue', value)
  emit('select', item)
}

const handleClickOutside = (event: MouseEvent) => {
  if (container.value && !container.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', handleClickOutside))
onUnmounted(() => document.removeEventListener('mousedown', handleClickOutside))
</script>

<template>
  <div ref="container" class="searchable-select-container">
    <input
      v-model="searchTerm"
      type="text"
      :placeholder="placeholder || 'Buscar...'"
      class="search-input"
      @focus="isOpen = true"
      autocomplete="off"
    />
    <div v-if="isOpen && searchTerm.length > 0" class="results-dropdown">
      <ul v-if="results.length > 0">
        <li
          v-for="item in results"
          :key="(item as T)[valueField]"
          class="results-item"
          @click="selectItem(item as T)"
        >
          <span class="item-name">{{ (item as T)[labelField] }}</span>
          <span class="item-email">{{ (item as T)['email'] }}</span>
        </li>
      </ul>
      <div v-else class="results-item is-empty">No se encontraron resultados.</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/index.scss' as *;

.searchable-select-container {
  position: relative;
  width: 100%;
}

.search-input {
  width: 100%;
  box-sizing: border-box;
  padding: 0.6rem;
  border: 1px solid rgba($BAKANO-PURPLE, 0.3);
  border-radius: 8px;
  font-size: 1rem;
  transition: border 0.2s ease;

  &:focus {
    outline: none;
    border-color: $BAKANO-PINK;
  }
}

.results-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: $white;
  border: 1px solid rgba($BAKANO-DARK, 0.1);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-height: 220px;
  overflow-y: auto;
  z-index: 1000;

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }
}

.results-item {
  padding: 0.75rem;
  cursor: pointer;
  color: $BAKANO-DARK;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: $overlay-purple;
  }

  &.is-empty {
    cursor: default;

    &:hover {
      background-color: transparent;
    }
  }
}

.item-name {
  display: block;
  font-weight: 600;
}

.item-email {
  display: block;
  font-size: 0.85rem;
  color: rgba($BAKANO-DARK, 0.7);
}
</style>
