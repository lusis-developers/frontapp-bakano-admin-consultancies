import { ref, readonly, computed } from 'vue'

// --- Estado reactivo compartido ---
const isVisible = ref(false)
const title = ref('')
const message = ref('')
const confirmationText = ref<string | null>(null)
const userInput = ref('')

let resolvePromise: (value: boolean) => void
let rejectPromise: (reason?: any) => void

export function useConfirmationDialog() {
  const isConfirmationMet = computed(() => {
    if (!confirmationText.value) {
      return true
    }
    return userInput.value === confirmationText.value
  })

  const reveal = (options: {
    title: string
    message: string
    confirmationText?: string
  }): Promise<boolean> => {
    title.value = options.title
    message.value = options.message
    confirmationText.value = options.confirmationText || null
    userInput.value = ''
    isVisible.value = true

    return new Promise<boolean>((resolve, reject) => {
      resolvePromise = resolve
      rejectPromise = reject
    })
  }

  const confirm = () => {
    if (!isConfirmationMet.value) return
    isVisible.value = false
    resolvePromise(true)
  }

  const cancel = () => {
    isVisible.value = false
    rejectPromise(false)
  }

  return {
    isVisible: readonly(isVisible),
    title: readonly(title),
    message: readonly(message),
    confirmationText: readonly(confirmationText),
    isConfirmationMet: readonly(isConfirmationMet),
    userInput,
    reveal,
    confirm,
    cancel,
  }
}
