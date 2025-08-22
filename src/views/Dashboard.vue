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
                <TableHead>Destino</TableHead>
                <TableHead>Solicitante</TableHead>
                <TableHead>Data Início</TableHead>
                <TableHead>Data Fim</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="request in filteredRequests" :key="request.id">
                <TableCell class="font-medium">#{{ request.id }}</TableCell>
                <TableCell>{{ request.destination }}</TableCell>
                <TableCell>{{ request.user?.name }}</TableCell>
                <TableCell>{{ formatDate(request.start_date) }}</TableCell>
                <TableCell>{{ formatDate(request.end_date) }}</TableCell>
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
                      <DropdownMenuItem @click="viewRequest(request)">
                        <Eye class="mr-2 h-4 w-4" />
                        Visualizar
                      </DropdownMenuItem>
                      <DropdownMenuItem @click="editRequest(request)">
                        <Edit class="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem @click="updateStatus(request, 'approved')" v-if="request.status === 'pending'">
                        <Check class="mr-2 h-4 w-4" />
                        Aprovar
                      </DropdownMenuItem>
                      <DropdownMenuItem @click="updateStatus(request, 'rejected')" v-if="request.status === 'pending'">
                        <X class="mr-2 h-4 w-4" />
                        Rejeitar
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
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, Search, Loader2, AlertCircle, MoreHorizontal, Eye, Edit, Check, X, FileText } from 'lucide-vue-next';
import api from '../api/axios';

// Estado
const travelRequests = ref([]);
const loading = ref(false);
const error = ref('');
const statusFilter = ref('all');
const searchQuery = ref('');
const showCreateModal = ref(false);
const selectedRequest = ref(null);

// Computed
const filteredRequests = computed(() => {
  let filtered = travelRequests.value;
  
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(req => req.status === statusFilter.value);
  }
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(req => 
      req.destination.toLowerCase().includes(query) ||
      req.user?.name.toLowerCase().includes(query)
    );
  }
  
  return filtered;
});

// Métodos
const loadTravelRequests = async () => {
  try {
    loading.value = true;
    error.value = '';
    const response = await api.get('/travel-requests');
    travelRequests.value = response.data;
  } catch (err) {
    error.value = 'Erro ao carregar pedidos de viagem';
    console.error('Erro:', err);
  } finally {
    loading.value = false;
  }
};

const updateStatus = async (request, newStatus) => {
  try {
    await api.patch(`/travel-requests/${request.id}/status`, { status: newStatus });
    request.status = newStatus;
    // Mostrar toast de sucesso aqui
  } catch (err) {
    console.error('Erro ao atualizar status:', err);
    // Mostrar toast de erro aqui
  }
};

const viewRequest = (request) => {
  // Implementar visualização detalhada
  console.log('Visualizar:', request);
};

const editRequest = (request) => {
  selectedRequest.value = request;
  showCreateModal.value = true;
};

const handleRequestSaved = () => {
  showCreateModal.value = false;
  selectedRequest.value = null;
  loadTravelRequests();
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('pt-BR');
};

const getStatusLabel = (status) => {
  const labels = {
    pending: 'Pendente',
    approved: 'Aprovado',
    rejected: 'Rejeitado',
    completed: 'Concluído'
  };
  return labels[status] || status;
};

const getStatusVariant = (status) => {
  const variants = {
    pending: 'secondary',
    approved: 'default',
    rejected: 'destructive',
    completed: 'outline'
  };
  return variants[status] || 'secondary';
};

// Lifecycle
onMounted(() => {
  loadTravelRequests();
});
</script>