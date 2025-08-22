<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Faça login em sua conta
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Sistema de Gestão de Viagens
        </p>
      </div>
      
      <Card class="mt-8">
        <CardHeader>
          <CardTitle>Entrar</CardTitle>
          <CardDescription>
            Digite suas credenciais para acessar o sistema
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form @submit.prevent="handleLogin" class="space-y-6">
            <div class="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                v-model="email"
                type="email"
                placeholder="seu.email@exemplo.com"
                required
                :disabled="loading"
              />
            </div>
            
            <div class="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                v-model="password"
                type="password"
                placeholder="••••••••"
                required
                :disabled="loading"
              />
            </div>
            
            <Button 
              type="submit" 
              class="w-full"
              :disabled="loading"
            >
              <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
              {{ loading ? 'Entrando...' : 'Entrar' }}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <!-- Alert para mensagens de erro -->
      <Alert v-if="error" variant="destructive" class="mt-4">
        <AlertCircle class="h-4 w-4" />
        <AlertTitle>Erro!</AlertTitle>
        <AlertDescription>
          {{ error }}
        </AlertDescription>
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