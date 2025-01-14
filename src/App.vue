<template>
  <n-config-provider :theme="darkTheme">
    <n-message-provider>
      <div class="min-h-screen bg-gray-900 py-12 px-4">
        <layout />
      </div>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup>
import Layout from './components/Layout.vue'
import { darkTheme } from 'naive-ui'
</script>

<style>
.min-h-screen {
  min-height: 100vh;
}

.bg-gray-900 {
  background-color: #111827;
}

.py-12 {
  padding-top: 3rem;
  padding-bottom: 3rem;
}

.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}
</style>