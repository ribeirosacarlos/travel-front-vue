<template>
  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Solicitante</th>
        <th>Destino</th>
        <th>Data de Ida</th>
        <th>Data de Volta</th>
        <th>Status</th>
        <th>Ações</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="travel in travels" :key="travel.id">
        <td>{{ travel.id }}</td>
        <td>{{ travel.user_name }}</td>
        <td>{{ travel.destination }}</td>
        <td>{{ travel.start_date }}</td>
        <td>{{ travel.end_date }}</td>
        <td>{{ travel.status }}</td>
        <td>
          <button @click="$emit('update-status', travel.id, 'aprovado')">Aprovar</button>
          <button @click="$emit('update-status', travel.id, 'cancelado')">Cancelar</button>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
defineProps({
  travels: Array
});
</script>
