<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-6">
      
      <!-- Cabeçalho -->
      <div class="text-center">
        <h1 class="text-4xl font-extrabold text-gray-900">Bem-vindo de volta</h1>
        <p class="mt-2 text-sm text-gray-600">Faça login para acessar o Sistema de Gestão de Viagens</p>
      </div>
      
      <!-- Card de Login -->
      <Card class="bg-white shadow-lg rounded-xl border border-gray-200">
        <CardHeader class="text-center">
          <CardTitle class="text-2xl font-semibold">Entrar</CardTitle>
          <CardDescription class="text-gray-500">
            Digite suas credenciais abaixo
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form @submit.prevent="handleLogin" class="space-y-5">
            
            <!-- Email -->
            <div class="space-y-1">
              <Label for="email" class="text-sm font-medium text-gray-700">Email</Label>
              <Input
                id="email"
                v-model="email"
                type="email"
                placeholder="seu.email@exemplo.com"
                required
                :disabled="loading"
                class="focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
              />
            </div>
            
            <!-- Senha -->
            <div class="space-y-1">
              <Label for="password" class="text-sm font-medium text-gray-700">Senha</Label>
              <Input
                id="password"
                v-model="password"
                type="password"
                placeholder="••••••••"
                required
                :disabled="loading"
                class="focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
              />
            </div>
            
            <!-- Botão -->
            <Button 
              type="submit" 
              class="w-full flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md py-2 transition-colors disabled:opacity-50"
              :disabled="loading"
            >
              <Loader2 v-if="loading" class="h-4 w-4 animate-spin" />
              {{ loading ? 'Entrando...' : 'Entrar' }}
            </Button>
            
          </form>
        </CardContent>
      </Card>
      
      <!-- Mensagem de Erro -->
      <Alert v-if="error" variant="destructive" class="mt-4 flex items-center gap-2">
        <AlertCircle class="h-5 w-5" />
        <div>
          <AlertTitle class="font-semibold">Erro</AlertTitle>
          <AlertDescription class="text-sm">{{ error }}</AlertDescription>
        </div>
      </Alert>
      
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../store/auth';
import { useRouter } from 'vue-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-vue-next';

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

const auth = useAuthStore();
const router = useRouter();

const handleLogin = async () => {
  try {
    loading.value = true;
    error.value = '';
    
    await auth.login(email.value, password.value);
    router.push('/');
  } catch (err) {
    error.value = err.response?.data?.message || 'Erro ao fazer login. Tente novamente.';
  } finally {
    loading.value = false;
  }
};
</script>
