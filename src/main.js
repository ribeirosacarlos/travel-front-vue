import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import './style.css'
import toastPlugin from './plugins/toast';

// importa o store para hidratar
import { useAuthStore } from './store/auth'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)
app.use(router)
app.use(toastPlugin);

// hidrata o store de auth antes de montar
const auth = useAuthStore()
auth.hydrateFromStorage()

app.mount('#app')
