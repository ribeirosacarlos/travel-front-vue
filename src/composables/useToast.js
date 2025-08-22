import { ref } from 'vue'

const toasts = ref([])
let toastId = 0

export const useToast = () => {
  const addToast = (message, type = 'success', errors = null, duration = 5000) => {
    const id = ++toastId
    
    const toast = {
      id,
      message,
      type,
      errors,
      createdAt: Date.now()
    }
    
    toasts.value.push(toast)
    
    // Auto remove após duration
    setTimeout(() => {
      removeToast(id)
    }, duration)
    
    return id
  }

  const removeToast = (id) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const success = (message, duration = 4000) => {
    return addToast(message, 'success', null, duration)
  }

  const error = (message, errors = null, duration = 6000) => {
    return addToast(message, 'error', errors, duration)
  }

  const clear = () => {
    toasts.value = []
  }

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    clear
  }
}