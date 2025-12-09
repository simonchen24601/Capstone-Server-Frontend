<script setup>
import LeftDock from './components/LeftDock.vue'
import MainPage from './components/MainPanel.vue'
</script>

<template>
  <div class="layout">
    <LeftDock />
    <div class="content-area">
      <MainPage />
    </div>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
}
.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
  overflow: auto;
}
header {
  line-height: 1.5;
}

@media (min-width: 1024px) {
}
</style>
