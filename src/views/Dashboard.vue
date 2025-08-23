<template>
  <div class="container mx-auto py-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p class="text-muted-foreground">
          Gerencie seus pedidos de viagem
        </p>
      </div>
      <Button @click="showCreateModal = true">
        <Plus class="mr-2 h-4 w-4" />
        Novo Pedido
      </Button>
    </div>

    <!-- Filtros -->
    <Card>
      <CardHeader>
        <CardTitle>Filtros</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="flex gap-4">
          <div class="flex-1">
            <Label htmlFor="status-filter">Status</Label>
            <Select v-model="statusFilter">
              <SelectTrigger>
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="approved">Aprovado</SelectItem>
                <SelectItem value="rejected">Rejeitado</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="flex-1">
            <Label htmlFor="search">Buscar</Label>
            <Input
              id="search"
              v-model="searchQuery"
              placeholder="Buscar por destino ou solicitante..."
            />
          </div>
          <div class="flex items-end">
            <Button @click="loadTravelRequests" variant="outline">
              <Search class="mr-2 h-4 w-4" />
              Buscar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Tabela de Pedidos -->
    <Card>
      <CardHeader>
        <CardTitle>Pedidos de Viagem</CardTitle>
        <CardDescription>
          Lista completa dos pedidos de viagem
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div v-if="loading" class="flex items-center justify-center py-8">
          <Loader2 class="h-8 w-8 animate-spin" />
          <span class="ml-2">Carregando...</span>
        </div>

        <div v-else-if="error" class="py-8">
          <Alert variant="destructive">
            <AlertCircle class="h-4 w-4" />
            <AlertTitle>Erro!</AlertTitle>
            <AlertDescription>{{ error }}</AlertDescription>
          </Alert>
        </div>

        <div v-else>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nome Viagem</TableHead>
                <TableHead>Destino</TableHead>
                <TableHead>Data Início</TableHead>
                <TableHead>Data Fim</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="request in filteredRequests" :key="request.id">
                <TableCell class="font-medium">#{{ request.id }}</TableCell>
                <TableCell>{{ request.requester_name }}</TableCell>
                <TableCell>{{ request.destination }}</TableCell>
                <TableCell>{{ formatDate(request.departure_date) }}</TableCell>
                <TableCell>{{ formatDate(request.return_date) }}</TableCell>
                <TableCell>
                  <Badge :variant="getStatusVariant(request.status)">
                    {{ getStatusLabel(request.status) }}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal class="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem @click="openTravelDetails(request)">
                        <Eye class="mr-2 h-4 w-4" />
                        Ver Detalhes
                      </DropdownMenuItem>
                      <DropdownMenuItem @click="updateStatus(request, 'aprovado')">
                        <Check class="mr-2 h-4 w-4" />
                        Aprovar
                      </DropdownMenuItem>
                      <DropdownMenuItem @click="updateStatus(request, 'cancelado')">
                        <X class="mr-2 h-4 w-4" />
                        Cancelar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>


            </TableBody>
          </Table>

          <div v-if="filteredRequests.length === 0" class="text-center py-8">
            <div class="flex flex-col items-center gap-2">
              <FileText class="h-12 w-12 text-muted-foreground" />
              <h3 class="text-lg font-medium">Nenhum pedido encontrado</h3>
              <p class="text-muted-foreground">Tente ajustar os filtros ou criar um novo pedido.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Modal de Criar/Editar Pedido -->
    <TravelRequestModal 
      v-if="showCreateModal" 
      @close="showCreateModal = false"
      @saved="handleRequestSaved"
      :request="selectedRequest"
    />
  </div>

  
  <!-- Modal de Cancelamento -->
  <Dialog :open="cancellationModalOpen" @update:open="cancellationModalOpen = false">
    <DialogContent class="sm:max-w-[400px]">
      <DialogHeader>
        <DialogTitle>Motivo do Cancelamento</DialogTitle>
      </DialogHeader>

      <div class="space-y-2">
        <Input
          v-model="cancellationReason"
          placeholder="Digite o motivo do cancelamento"
          :disabled="loadingCancel"
        />
      </div>

      <DialogFooter>
        <Button 
          variant="outline" 
          @click="cancellationModalOpen = false" 
          :disabled="loadingCancel"
        >
          Cancelar
        </Button>
        <Button 
          @click="submitCancellation" 
          class="bg-green-600 hover:bg-green-700"
          :disabled="loadingCancel"
        >
          <Loader2 v-if="loadingCancel" class="mr-2 h-4 w-4 animate-spin" />
          Salvar
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <Dialog v-model:open="showDetailsModal">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Detalhes da Viagem</DialogTitle>
        <DialogDescription v-if="selectedRequest">
          Veja as informações completas do pedido de viagem.
        </DialogDescription>
      </DialogHeader>

      <div v-if="selectedRequest" class="space-y-2">
        <p><strong>ID:</strong> #{{ selectedRequest.id }}</p>
        <p><strong>Solicitante:</strong> {{ selectedRequest.requester_name }}</p>
        <p><strong>Destino:</strong> {{ selectedRequest.destination }}</p>
        <p><strong>Data de Partida:</strong> {{ formatDate(selectedRequest.departure_date) }}</p>
        <p><strong>Data de Retorno:</strong> {{ formatDate(selectedRequest.return_date) }}</p>
        <p>
          <strong>Status:</strong>
          <Badge :variant="getStatusVariant(selectedRequest.status)">
            {{ getStatusLabel(selectedRequest.status) }}
          </Badge>
        </p>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="showDetailsModal = false">Fechar</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>


</template>

<script setup>
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ref, computed, onMounted } from 'vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Plus, Search, Loader2, AlertCircle, MoreHorizontal, Eye, Edit, Check, X, FileText } from 'lucide-vue-next'
import api from '../api/axios'
import TravelRequestModal from '@/components/TravelRequestModal.vue'
import { XCircle } from 'lucide-vue-next';
import { useToast } from '../composables/useToast';


// Estado
const travelRequests = ref([])
const loading = ref(false)
const error = ref('')
const statusFilter = ref('all')
const searchQuery = ref('')
const showCreateModal = ref(false)
const selectedRequest = ref(null)

const cancellationModalOpen = ref(false)
const cancellingRequest = ref(null)
const cancellationReason = ref('')
const loadingCancel = ref(false)
const { success, error: toastError } = useToast();
const showDetailsModal = ref(false)

// Computed
const filteredRequests = computed(() => {
  let filtered = travelRequests.value

  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(req => req.status === statusFilter.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(req =>
      req.destination.toLowerCase().includes(query) ||
      req.requester_name.toLowerCase().includes(query)
    )
  }

  return filtered
})

// Métodos
const loadTravelRequests = async () => {
  try {
    loading.value = true
    error.value = ''
    const response = await api.get('/travel-requests')
    travelRequests.value = response.data.data
  } catch (err) {
    error.value = 'Erro ao carregar pedidos de viagem'
    console.error('Erro:', err)
  } finally {
    loading.value = false
  }
}

const updateStatus = async (request, newStatus) => {
  console.log('🔄 Atualizando status para:', newStatus);
  
  if (newStatus === 'cancelado') {
    cancellingRequest.value = request
    cancellationReason.value = ''
    cancellationModalOpen.value = true
    return
  }

  try {
    const response = await api.patch(`/travel-requests/${request.id}/status`, { status: newStatus })
    
    Object.assign(request, response.data.data)
    
    const message = response.data.message || 
                   (newStatus === 'aprovado' ? 'Pedido aprovado com sucesso!' : 'Status atualizado com sucesso!');
    success(message);
    
  } catch (err) {
    console.log('❌ Erro ao atualizar status:', err.response?.data);
    
    const errorMessage = err.response?.data?.error || 'Erro ao atualizar status';
    toastError(errorMessage);
    
  }
}
const submitCancellation = async () => {
  
  if (!cancellationReason.value.trim()) {
    const errorMsg = 'Informe o motivo do cancelamento';
    toastError(errorMsg);
    return
  }

  try {
    loadingCancel.value = true

    const response = await api.patch(
      `/travel-requests/${cancellingRequest.value.id}/status`,
      {
        status: 'cancelado',
        cancellation_reason: cancellationReason.value
      }
    )

    Object.assign(cancellingRequest.value, response.data.data)

    const message = response.data.message || 'Pedido cancelado com sucesso!';
    success(message);


    setTimeout(() => {
      cancellationModalOpen.value = false
      cancellationReason.value = ''
    }, 1500)

  } catch (err) {    
    let errorMessage;
    
    if (err.response?.data?.errors && typeof err.response.data.errors === 'object') {
      const firstField = Object.keys(err.response.data.errors)[0];
      errorMessage = err.response.data.errors[firstField][0];
    } else {
      errorMessage = err.response?.data?.error || 'Erro ao cancelar';
    }
    
    toastError(errorMessage, err.response?.data?.errors || null);
    
  } finally {
    loadingCancel.value = false
  }
}

const openTravelDetails = (request) => {
  selectedRequest.value = request
  showDetailsModal.value = true
}

const viewRequest = (request) => {
  console.log('Visualizar:', request)
}

const editRequest = (request) => {
  selectedRequest.value = request
  showCreateModal.value = true
}

const handleRequestSaved = () => {
  showCreateModal.value = false
  selectedRequest.value = null
  loadTravelRequests()
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('pt-BR')
}

const getStatusLabel = (status) => {
  const labels = {
    solicitado: 'Pendente',
    aprovado: 'Aprovado',
    rejeitado: 'Rejeitado',
    concluido: 'Concluído'
  }
  return labels[status] || status
}

const getStatusVariant = (status) => {
  const variants = {
    solicitado: 'secondary',
    aprovado: 'default',
    rejeitado: 'destructive',
    concluido: 'outline'
  }
  return variants[status] || 'secondary'
}

// Lifecycle
onMounted(() => {
  loadTravelRequests()
})
</script>
