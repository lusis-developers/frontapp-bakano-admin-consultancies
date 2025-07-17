<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue: string
  placeholder?: string
  isLoading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const localSearchTerm = ref(props.modelValue)
let debounceTimer: number | undefined

watch(localSearchTerm, (newVal) => {
  clearTimeout(debounceTimer)
  debounceTimer = window.setTimeout(() => {
    emit('update:modelValue', newVal)
  }, 500)
})

watch(() => props.modelValue, (newVal) => {
  if (newVal !== localSearchTerm.value) {
    localSearchTerm.value = newVal
  }
})
</script>

<template>
  <div class="search-bar-container">
    <div class="search-bar">
      <i class="fas fa-search search-icon"></i>
      <input
        v-model="localSearchTerm"
        type="text"
        :placeholder="placeholder || 'Buscar...'"
        class="search-input"
        :disabled="isLoading"
      />
      <i v-if="isLoading" class="fas fa-spinner fa-spin loading-icon"></i>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/index.scss' as *;

.search-bar-container {
  width: 100%;
}

.search-bar {
  position: relative;
}

.search-icon,
.loading-icon {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  color: rgba($BAKANO-DARK, 0.4);
}

.search-icon {
  left: 1rem;
}

.loading-icon {
  right: 1rem;
}

.search-input {
  width: 70%;
  padding: 0.8rem 1rem 0.8rem 3rem;
  font-size: 1rem;
  border: 2px solid $BAKANO-LIGHT;
  border-radius: 8px;
  background-color: $white;
  transition: all 0.2s ease;
  text-overflow: ellipsis;

  &:focus {
    outline: none;
    border-color: $BAKANO-PINK;
    box-shadow: 0 0 0 3px rgba($BAKANO-PINK, 0.1);
  }

  &:disabled {
    background-color: lighten($BAKANO_LIGHT, 2%);
    cursor: not-allowed;
  }
}

.search-input::placeholder {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: rgba($BAKANO-DARK, 0.5);
}
</style>