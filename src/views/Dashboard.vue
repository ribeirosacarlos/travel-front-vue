<template>
  <div>
    <h1>Pedidos de Viagem</h1>
    <select v-model="filterStatus" @change="fetchTravels">
      <option value="">Todos</option>
      <option value="solicitado">Solicitado</option>
      <option value="aprovado">Aprovado</option>
      <option value="cancelado">Cancelado</option>
    </select>
    <loading-spinner v-if="loading" />
    <dashboard-table 
      v-else
      :travels="travels" 
      @update-status="updateStatus"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../api/axios';
import DashboardTable from '../components/DashboardTable.vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';

const travels = ref([]);
const loading = ref(false);
const filterStatus = ref('');

const fetchTravels = async () => {
  loading.value = true;
  try {
    const response = await api.get('/travel-requests', { params: { status: filterStatus.value } });
    travels.value = response.data;
  } finally {
    loading.value = false;
  }
};

const updateStatus = async (id, status) => {
  try {
    await api.patch(`/travel-requests/${id}/status`, { status });
    alert('Status atualizado!');
    fetchTravels();
  } catch (err) {
    alert('Erro ao atualizar status');
  }
};

onMounted(fetchTravels);
</script>
