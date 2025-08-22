<template>
  <div id="app">
    <router-view />
    <ToastContainer  />
  </div>
</template>

<script setup>
</script>

<style>
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
}

#app {
  padding: 20px;
}
</style>


<script>
import ToastContainer from '@/components/ToastContainer.vue'

export default {
  name: 'App',
  components: {
    ToastContainer
  }
}
</script>
