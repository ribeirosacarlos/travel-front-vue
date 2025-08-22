<template>
  <Dialog :open="true" @update:open="$emit('close')">
    <DialogContent class="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>
          {{ isEditing ? 'Editar Pedido' : 'Novo Pedido de Viagem' }}
        </DialogTitle>
        <DialogDescription>
          {{ isEditing ? 'Atualize as informações do pedido' : 'Preencha os detalhes da sua viagem' }}
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="space-y-2">
          <Label htmlFor="requester_name">Solicitante *</Label>
          <Input
            id="requester_name"
            v-model="form.requester_name"
            placeholder="Ex: Carlos Gabriel"
            required
            :disabled="loading"
          />
        </div>

        <div class="space-y-2">
          <Label htmlFor="destination">Destino *</Label>
          <Input
            id="destination"
            v-model="form.destination"
            placeholder="Ex: São Paulo, SP"
            required
            :disabled="loading"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label htmlFor="departure_date">Data de Início *</Label>
            <Input
              id="departure_date"
              v-model="form.departure_date"
              type="date"
              required
              :disabled="loading"
            />
          </div>

          <div class="space-y-2">
            <Label htmlFor="return_date">Data de Fim *</Label>
            <Input
              id="return_date"
              v-model="form.return_date"
              type="date"
              required
              :disabled="loading"
            />
          </div>
        </div>

        <!-- Botões de Ação -->
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            @click="$emit('close')"
            :disabled="loading"
          >
            Cancelar
          </Button>
          <Button 
            type="submit"
            :disabled="loading || !isFormValid"
          >
            <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
            {{ loading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar Pedido') }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-vue-next';
import api from '../api/axios';
import { useToast } from '../composables/useToast';

const props = defineProps({
  request: {
    type: Object,
    default: null
  },
  userId: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['close', 'saved']);

const { success, error: toastError } = useToast();

const loading = ref(false);
const error = ref('');
const validationError = ref('');

const form = ref({
  requester_name: '',
  destination: '',
  departure_date: '',
  return_date: ''
});

const isEditing = computed(() => !!props.request);

const isFormValid = computed(() => {
  return form.value.requester_name && 
         form.value.destination && 
         form.value.departure_date && 
         form.value.return_date;
});

watch(() => form.value.departure_date, (newDate) => {
  if (newDate && form.value.return_date && newDate > form.value.return_date) {
    form.value.return_date = newDate;
  }
});

watch(() => form.value.return_date, (newDate) => {
  if (newDate && form.value.departure_date && newDate < form.value.departure_date) {
    validationError.value = 'A data de fim deve ser posterior à data de início';
  } else {
    validationError.value = '';
  }
});

const handleSubmit = async () => {
  console.log('🚀 handleSubmit chamado!');
  
  try {
    loading.value = true;
    error.value = '';
    validationError.value = '';

    if (!isFormValid.value) {
      validationError.value = 'Por favor, preencha todos os campos obrigatórios';
      return;
    }

    if (form.value.return_date < form.value.departure_date) {
      validationError.value = 'A data de fim deve ser posterior à data de início';
      return;
    }

    const payload = {
      user_id: props.userId,
      requester_name: form.value.requester_name,
      destination: form.value.destination,
      departure_date: form.value.departure_date,
      return_date: form.value.return_date
    };

    let response;
    if (isEditing.value) {
      response = await api.put(`/travel-requests/${props.request.id}`, payload);
      console.log('✅ Pedido atualizado:', response.data);
    } else {
      response = await api.post('/travel-requests', payload);
      console.log('✅ Pedido criado:', response.data);
    }

    const message = response.data.message || 
                   (isEditing.value ? 'Pedido atualizado com sucesso!' : 'Pedido criado com sucesso!');
    success(message);

    setTimeout(() => {
      emit('saved');
      emit('close');
    }, 1500);

  } catch (err) {
    console.log('❌ Erro capturado:', err.response?.data);
    
    if (err.response?.data) {
      const data = err.response.data;
      if (data.errors && typeof data.errors === 'object') {
        const message = data.error || data.message || 'Dados inválidos';
        toastError(message, data.errors);
        
        const firstErrorField = Object.keys(data.errors)[0];
        const firstErrorMessage = data.errors[firstErrorField][0];
        error.value = firstErrorMessage || message;
      } else {
        const message = data.message || data.error || 'Erro ao salvar o pedido';
        toastError(message);
        error.value = message;
      }
    } else {
      toastError('Erro de conexão com o servidor');
      error.value = 'Erro ao salvar o pedido';
    }

    console.error('Erro completo:', err);
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  form.value = {
    requester_name: '',
    destination: '',
    departure_date: '',
    return_date: ''
  };
};

const loadRequestData = () => {
  if (props.request) {
    form.value = {
      requester_name: props.request.requester_name || '',
      destination: props.request.destination || '',
      departure_date: props.request.departure_date || '',
      return_date: props.request.return_date || ''
    };
  }
};

onMounted(() => {
  console.log('🎯 Modal montado!');
  if (isEditing.value) {
    loadRequestData();
  } else {
    resetForm();
  }
});
</script>