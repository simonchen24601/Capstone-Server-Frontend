<template>
  <div class="main-page">
    <header class="toolbar">
      <el-input v-model="search" placeholder="Search..." clearable style="max-width: 320px;" />
      <el-button type="primary" @click="refresh">Refresh</el-button>
    </header>

    <section class="content">
      <el-card shadow="hover" class="card">
        <template #header>
          <div class="card-header">
            <span>Latest Sensor Data</span>
            <el-tag :type="latest ? 'success' : 'info'">{{ latest ? 'Live' : 'No Data' }}</el-tag>
          </div>
        </template>
        <el-descriptions v-if="latest" :column="1" border>
          <el-descriptions-item label="Device Key">
            {{ latest.device_key || latest.device_id }}
          </el-descriptions-item>
          <el-descriptions-item label="Temperature (°C)">
            {{ latest.temperature_celsius }}
          </el-descriptions-item>
          <el-descriptions-item label="Humidity">
            {{ Number(latest.humidity_percent).toFixed(2) }} %
          </el-descriptions-item>
          <el-descriptions-item label="Timestamp">
            {{ latest.timestamp }}
          </el-descriptions-item>
          <el-descriptions-item label="Record ID">
            {{ latest.id }}
          </el-descriptions-item>
        </el-descriptions>
        <el-empty v-else description="No latest record" />
      </el-card>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getTemperatureLatest } from '../api.js'

const search = ref('')
const latest = ref(null)

async function loadLatest() {
  const apiKey = localStorage.getItem('apiKey') || ''
  const deviceKey = localStorage.getItem('selectedDeviceKey') || localStorage.getItem('selectedDeviceName') || localStorage.getItem('selectedDeviceId') || ''
  if (!apiKey) {
    latest.value = null
    ElMessage.warning('Please set API key in the left panel')
    return
  }
  try {
    const params = deviceKey ? { device_key: deviceKey } : {}
    const { data } = await getTemperatureLatest(params, {
      headers: { 'X-API-Key': apiKey }
    })
    latest.value = data || null
  } catch (e) {
    latest.value = null
    ElMessage.error('Failed to fetch latest data')
  }
}

function refresh() {
  loadLatest()
}

onMounted(() => {
  loadLatest()
})

// Auto-refresh every 10 seconds
let refreshTimer = null
onMounted(() => {
  refreshTimer = setInterval(() => {
    loadLatest()
  }, 10000)
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
})
</script>

<style scoped>
.main-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}
.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
}
.content {
  flex: 1;
}
.card {
  max-width: 800px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
