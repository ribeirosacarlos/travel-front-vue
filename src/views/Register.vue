<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <div class="flex justify-center">
          <Plane class="h-12 w-12 text-blue-600" />
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Criar nova conta
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Ou
          <router-link 
            to="/login" 
            class="font-medium text-blue-600 hover:text-blue-500 transition-colors"
          >
            faça login em sua conta existente
          </router-link>
        </p>
      </div>
      
      <Card class="mt-8">
        <CardHeader>
          <CardTitle>Registrar-se</CardTitle>
          <CardDescription>
            Preencha os dados abaixo para criar sua conta
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form @submit.prevent="handleRegister" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  v-model="form.name"
                  type="text"
                  placeholder="João Silva"
                  required
                  :disabled="loading"
                />
              </div>
              
              <div class="space-y-2">
                <Label htmlFor="department">Departamento</Label>
                <Input
                  id="department"
                  v-model="form.department"
                  type="text"
                  placeholder="TI, Vendas, etc."
                  :disabled="loading"
                />
              </div>
            </div>
            
            <div class="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                v-model="form.email"
                type="email"
                placeholder="joao.silva@empresa.com"
                required
                :disabled="loading"
              />
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label htmlFor="password">Senha *</Label>
                <Input
                  id="password"
                  v-model="form.password"
                  type="password"
                  placeholder="••••••••"
                  required
                  :disabled="loading"
                />
                <p class="text-xs text-gray-500">
                  Mínimo de 8 caracteres
                </p>
              </div>
              
              <div class="space-y-2">
                <Label htmlFor="password_confirmation">Confirmar Senha *</Label>
                <Input
                  id="password_confirmation"
                  v-model="form.password_confirmation"
                  type="password"
                  placeholder="••••••••"
                  required
                  :disabled="loading"
                />
              </div>
            </div>
            
            <div class="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                v-model="form.phone"
                type="tel"
                placeholder="(11) 99999-9999"
                :disabled="loading"
              />
            </div>
            
            <!-- Validações -->
            <div v-if="validationErrors.length > 0" class="space-y-2">
              <Alert variant="destructive">
                <AlertCircle class="h-4 w-4" />
                <AlertTitle>Erros de validação</AlertTitle>
                <AlertDescription>
                  <ul class="list-disc list-inside space-y-1">
                    <li v-for="error in validationErrors" :key="error">{{ error }}</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
            
            <!-- Termos e Condições -->
            <div class="flex items-center space-x-2">
              <Checkbox 
                id="terms" 
                v-model="acceptTerms"
                :disabled="loading"
              />
              <Label 
                htmlFor="terms" 
                class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Aceito os 
                <a href="#" class="text-blue-600 hover:text-blue-500">termos de uso</a>
                e 
                <a href="#" class="text-blue-600 hover:text-blue-500">política de privacidade</a>
              </Label>
            </div>
            
            <Button 
              type="submit" 
              class="w-full"
              :disabled="loading || !isFormValid"
            >
              <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
              {{ loading ? 'Criando conta...' : 'Criar conta' }}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <!-- Informações adicionais -->
      <div class="text-center">
        <p class="text-xs text-gray-500">
          Ao criar uma conta, você concorda com nossos termos de serviço e política de privacidade.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '../store/auth';
import { useRouter } from 'vue-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, AlertCircle, Plane } from 'lucide-vue-next';

const auth = useAuthStore();
const router = useRouter();

// Estado do formulário
const form = ref({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  department: '',
  phone: ''
});

const loading = ref(false);
const acceptTerms = ref(false);
const validationErrors = ref([]);

// Computed
const isFormValid = computed(() => {
  return form.value.name &&
         form.value.email &&
         form.value.password &&
         form.value.password_confirmation &&
         acceptTerms.value &&
         validationErrors.value.length === 0;
});

// Métodos
const validateForm = () => {
  const errors = [];
  
  if (form.value.password.length < 8) {
    errors.push('A senha deve ter pelo menos 8 caracteres');
  }
  
  if (form.value.password !== form.value.password_confirmation) {
    errors.push('As senhas não coincidem');
  }
  
  if (!form.value.email.includes('@')) {
    errors.push('Email inválido');
  }
  
  if (!acceptTerms.value) {
    errors.push('Você deve aceitar os termos de uso');
  }
  
  validationErrors.value = errors;
  return errors.length === 0;
};

const handleRegister = async () => {
  if (!validateForm()) return;
  
  try {
    loading.value = true;
    
    await auth.register(form.value);
    
    // Após registro bem-sucedido, redireciona para login
    router.push({
      path: '/login',
      query: { message: 'Conta criada com sucesso! Faça login para continuar.' }
    });
    
  } catch (error) {
    console.error('Erro no registro:', error);
    
    // Trata erros específicos do servidor
    if (error.response?.data?.errors) {
      const serverErrors = Object.values(error.response.data.errors).flat();
      validationErrors.value = serverErrors;
    }
  } finally {
    loading.value = false;
  }
};

// Watchers para validação em tempo real
import { watch } from 'vue';

watch([
  () => form.value.password,
  () => form.value.password_confirmation,
  () => form.value.email,
  () => acceptTerms.value
], () => {
  if (validationErrors.value.length > 0) {
    validateForm();
  }
});
</script>