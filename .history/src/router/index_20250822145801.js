import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import TravelForm from '../views/TravelForm.vue'

const routes = [
  { path: '/login', component: Login },
  { path: '/', component: Dashboard },
  { path: '/new-travel', component: TravelForm }
]

const router = createRouter({
  history: createWebHistory(), // <- importante
  routes
})

export default router
