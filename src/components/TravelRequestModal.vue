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
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Destino -->
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

          <!-- Tipo de Viagem -->
          <div class="space-y-2">
            <Label htmlFor="trip-type">Tipo de Viagem</Label>
            <Select v-model="form.trip_type">
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="business">Negócios</SelectItem>
                <SelectItem value="training">Treinamento</SelectItem>
                <SelectItem value="conference">Conferência</SelectItem>
                <SelectItem value="meeting">Reunião</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Data de Início -->
          <div class="space-y-2">
            <Label htmlFor="start-date">Data de Início *</Label>
            <Input
              id="start-date"
              v-model="form.start_date"
              type="date"
              required
              :disabled="loading"
            />
          </div>

          <!-- Data de Fim -->
          <div class="space-y-2">
            <Label htmlFor="end-date">Data de Fim *</Label>
            <Input
              id="end-date"
              v-model="form.end_date"
              type="date"
              required
              :disabled="loading"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Orçamento Estimado -->
          <div class="space-y-2">
            <Label htmlFor="budget">Orçamento Estimado (R$)</Label>
            <Input
              id="budget"
              v-model="form.estimated_budget"
              type="number"
              step="0.01"
              placeholder="0.00"
              :disabled="loading"
            />
          </div>

          <!-- Prioridade -->
          <div class="space-y-2">
            <Label htmlFor="priority">Prioridade</Label>
            <Select v-model="form.priority">
              <SelectTrigger>
                <SelectValue placeholder="Selecione a prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <!-- Descrição/Justificativa -->
        <div class="space-y-2">
          <Label htmlFor="description">Descrição/Justificativa *</Label>
          <Textarea
            id="description"
            v-model="form.description"
            placeholder="Descreva o motivo da viagem e detalhes importantes..."
            rows="4"
            required
            :disabled="loading"
          />
        </div>

        <!-- Necessidades Especiais -->
        <div class="space-y-2">
          <Label htmlFor="special-needs">Necessidades Especiais</Label>
          <Textarea
            id="special-needs"
            v-model="form.special_requirements"
            placeholder="Acomodações especiais, restrições alimentares, etc..."
            rows="2"
            :disabled="loading"
          />
        </div>

        <!-- Alertas de Validação -->
        <Alert v-if="validationError" variant="destructive">
          <AlertCircle class="h-4 w-4" />
          <AlertTitle>Erro de Validação</AlertTitle>
          <AlertDescription>{{ validationError }}</AlertDescription>
        </Alert>

        <Alert v-if="error" variant="destructive">
          <AlertCircle class="h-4 w-4" />
          <AlertTitle>Erro!</AlertTitle>
          <AlertDescription>{{ error }}</AlertDescription>
        </Alert>

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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-vue-next';
import api from '../api/axios';

const props = defineProps({
  request: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close', 'saved']);

// Estado
const loading = ref(false);
const error = ref('');
const validationError = ref('');

const form = ref({
  destination: '',
  trip_type: '',
  start_date: '',
  end_date: '',
  estimated_budget: '',
  priority: 'medium',
  description: '',
  special_requirements: ''
});

// Computed
const isEditing = computed(() => !!props.request);

const isFormValid = computed(() => {
  return form.value.destination && 
         form.value.start_date && 
         form.value.end_date && 
         form.value.description;
});

// Watchers
watch(() => form.value.start_date, (newDate) => {
  if (newDate && form.value.end_date && newDate > form.value.end_date) {
    form.value.end_date = newDate;
  }
});

watch(() => form.value.end_date, (newDate) => {
  if (newDate && form.value.start_date && newDate < form.value.start_date) {
    validationError.value = 'A data de fim deve ser posterior à data de início';
  } else {
    validationError.value = '';
  }
});

// Métodos
const handleSubmit = async () => {
  try {
    loading.value = true;
    error.value = '';
    validationError.value = '';

    // Validações básicas
    if (!isFormValid.value) {
      validationError.value = 'Por favor, preencha todos os campos obrigatórios';
      return;
    }

    if (form.value.end_date < form.value.start_date) {
      validationError.value = 'A data de fim deve ser posterior à data de início';
      return;
    }

    const payload = {
      ...form.value,
      estimated_budget: form.value.estimated_budget ? parseFloat(form.value.estimated_budget) : null
    };

    if (isEditing.value) {
      await api.put(`/travel-requests/${props.request.id}`, payload);
    } else {
      await api.post('/travel-requests', payload);
    }

    emit('saved');
  } catch (err) {
    error.value = err.response?.data?.message || 'Erro ao salvar o pedido';
    console.error('Erro:', err);
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  form.value = {
    destination: '',
    trip_type: '',
    start_date: '',
    end_date: '',
    estimated_budget: '',
    priority: 'medium',
    description: '',
    special_requirements: ''
  };
};

const loadRequestData = () => {
  if (props.request) {
    form.value = {
      destination: props.request.destination || '',
      trip_type: props.request.trip_type || '',
      start_date: props.request.start_date || '',
      end_date: props.request.end_date || '',
      estimated_budget: props.request.estimated_budget || '',
      priority: props.request.priority || 'medium',
      description: props.request.description || '',
      special_requirements: props.request.special_requirements || ''
    };
  }
};

// Lifecycle
onMounted(() => {
  if (isEditing.value) {
    loadRequestData();
  } else {
    resetForm();
  }
});
</script>