import { useToast } from '@/composables/useToast';
import Toast from '@/components/Toast.vue';

export default {
  install(app) {
    const toast = useToast();
    
    app.provide('toast', toast);
    app.config.globalProperties.$toast = toast;
    app.component('Toast', Toast);
  }
};