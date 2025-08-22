<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header/Navbar -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <!-- Logo e Navegação -->
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <Plane class="h-8 w-8 text-blue-600" />
              <span class="ml-2 text-xl font-bold text-gray-900">TravelManager</span>
            </div>
            
            <!-- Navegação Desktop -->
            <nav class="hidden md:ml-8 md:flex md:space-x-8">
              <router-link
                to="/"
                class="inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors"
                :class="isActiveRoute('/') ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'"
              >
                <LayoutDashboard class="mr-2 h-4 w-4" />
                Dashboard
              </router-link>
              
            </nav>
          </div>

          <!-- Menu do usuário -->
          <div class="flex items-center space-x-4">
           

            <!-- Dropdown do usuário -->
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" class="relative h-8 w-8 rounded-full">
                  <Avatar class="h-8 w-8">
                    <AvatarImage :src="user?.avatar" :alt="user?.name" />
                    <AvatarFallback>
                      {{ user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() }}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent class="w-56" align="end">
                <DropdownMenuLabel class="font-normal">
                  <div class="flex flex-col space-y-1">
                    <p class="text-sm font-medium leading-none">{{ user?.name }}</p>
                    <p class="text-xs leading-none text-muted-foreground">{{ user?.email }}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem @click="goToProfile">
                  <User class="mr-2 h-4 w-4" />
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem @click="goToSettings">
                  <Settings class="mr-2 h-4 w-4" />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem @click="handleLogout" class="text-red-600">
                  <LogOut class="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <!-- Menu Mobile -->
            <Sheet v-model:open="mobileMenuOpen">
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" class="md:hidden">
                  <Menu class="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" class="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav class="flex flex-col space-y-4 mt-6">
                  <router-link
                    to="/"
                    class="flex items-center space-x-2 text-lg font-medium transition-colors hover:text-blue-600"
                    @click="mobileMenuOpen = false"
                  >
                    <LayoutDashboard class="h-5 w-5" />
                    <span>Dashboard</span>
                  </router-link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <router-view />
    </main>

    <!-- Toast Container -->
    <div class="fixed bottom-4 right-4 z-50">
      <div v-for="toast in toasts" :key="toast.id" class="mb-2">
        <Alert :variant="toast.type" class="w-96">
          <component :is="getToastIcon(toast.type)" class="h-4 w-4" />
          <AlertTitle>{{ toast.title }}</AlertTitle>
          <AlertDescription>{{ toast.message }}</AlertDescription>
          <Button
            variant="ghost"
            size="sm"
            class="absolute top-2 right-2 h-6 w-6 p-0"
            @click="removeToast(toast.id)"
          >
            <X class="h-3 w-3" />
          </Button>
        </Alert>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../store/auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Plane, 
  LayoutDashboard, 
  FileText, 
  BarChart3, 
  Bell, 
  User, 
  Settings, 
  LogOut, 
  Menu,
  X,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

// Estado
const mobileMenuOpen = ref(false);
const unreadNotifications = ref(0);
const toasts = ref([]);

// Computed
const user = computed(() => auth.user);

// Métodos
const isActiveRoute = (path) => {
  return route.path === path;
};

const handleLogout = async () => {
  try {
    await auth.logout();
    router.push('/login');
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
  }
};

const goToProfile = () => {
  router.push('/profile');
};

const goToSettings = () => {
  router.push('/settings');
};

const addToast = (toast) => {
  const id = Date.now();
  toasts.value.push({ ...toast, id });
  
  // Remove automaticamente após 5 segundos
  setTimeout(() => {
    removeToast(id);
  }, 5000);
};

const removeToast = (id) => {
  const index = toasts.value.findIndex(toast => toast.id === id);
  if (index > -1) {
    toasts.value.splice(index, 1);
  }
};

const getToastIcon = (type) => {
  const icons = {
    default: Info,
    destructive: AlertCircle,
    success: CheckCircle
  };
  return icons[type] || Info;
};

// Lifecycle
onMounted(async () => {
  // Carregar dados do usuário se não estiverem disponíveis
  if (!user.value && auth.token) {
    try {
      const response = await api.get('/auth/me');
      auth.user = response.data;
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      auth.logout();
      router.push('/login');
    }
  }
});

// Expor métodos para componentes filhos
defineExpose({
  addToast
});
</script>