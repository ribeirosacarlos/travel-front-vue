<template>
  <div class="toast-container">
    <Transition
      v-for="toast in toasts"
      :key="toast.id"
      name="toast"
      appear
    >
      <div
        :class="[
          'toast',
          `toast--${toast.type}`
        ]"
      >
        <div class="toast__icon">
          <svg v-if="toast.type === 'success'" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg v-else-if="toast.type === 'error'" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="toast__content">
          <div class="toast__message">{{ toast.message }}</div>
          <div v-if="toast.errors" class="toast__errors">
            <div v-for="(errorList, field) in toast.errors" :key="field" class="toast__error-item">
              <span v-for="error in errorList" :key="error">{{ error }}</span>
            </div>
          </div>
        </div>
        <button @click="removeToast(toast.id)" class="toast__close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { inject } from 'vue';

const { toasts, removeToast } = inject('toast');
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 400px;
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.toast--success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.toast--error {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.toast__icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.toast__content {
  flex: 1;
  min-width: 0;
}

.toast__message {
  font-weight: 600;
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 4px;
}

.toast__errors {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.toast__error-item span {
  display: block;
  font-size: 13px;
  opacity: 0.9;
  line-height: 1.3;
}

.toast__close {
  background: none;
  border: none;
  color: currentColor;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  opacity: 0.7;
  transition: opacity 0.2s;
  flex-shrink: 0;
}

.toast__close:hover {
  opacity: 1;
}

/* Animações */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.95);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.95);
}
</style>