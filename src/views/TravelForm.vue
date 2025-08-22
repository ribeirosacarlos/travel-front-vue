<template>
  <form @submit.prevent="submitForm">
    <input v-model="name" placeholder="Nome do solicitante" />
    <input v-model="destination" placeholder="Destino" />
    <input v-model="startDate" type="date" placeholder="Data de ida" />
    <input v-model="endDate" type="date" placeholder="Data de volta" />
    <button type="submit">Criar Pedido</button>
  </form>
</template>

<script setup>
import { ref } from 'vue';
import api from '../api/axios';
import { useRouter } from 'vue-router';

const name = ref('');
const destination = ref('');
const startDate = ref('');
const endDate = ref('');
const router = useRouter();

const submitForm = async () => {
  try {
    await api.post('/travel-requests', {
      name: name.value,
      destination: destination.value,
      start_date: startDate.value,
      end_date: endDate.value,
    });
    alert('Pedido criado com sucesso!');
    router.push('/');
  } catch (err) {
    alert('Erro ao criar pedido');
  }
};
</script>
