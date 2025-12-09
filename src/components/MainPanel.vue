<template>
  <div class="main-page">
    <!-- toolbar removed -->

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
            {{ maskKey(latest.device_key || latest.device_id) }}
          </el-descriptions-item>
          <el-descriptions-item label="Temperature">
            {{ Number(latest.temperature_celsius).toFixed(2) }} °C
          </el-descriptions-item>
          <el-descriptions-item label="Humidity">
            {{ Number(latest.humidity_percent).toFixed(2) }} %
          </el-descriptions-item>
          <el-descriptions-item label="Timestamp">
            {{ formatTimestamp(latest.timestamp) }}
          </el-descriptions-item>
          <el-descriptions-item label="Record ID">
            {{ latest.id }}
          </el-descriptions-item>
        </el-descriptions>
        <el-empty v-else description="No latest record" />
      </el-card>
      <div class="charts">
        <el-card shadow="always" class="card">
          <template #header>
            <div class="card-header">
              <span>Temperature History</span>
            </div>
          </template>
          <div ref="tempChartRef" class="chart"></div>
        </el-card>
        <el-card shadow="always" class="card">
          <template #header>
            <div class="card-header">
              <span>Humidity History</span>
            </div>
          </template>
          <div ref="humChartRef" class="chart"></div>
        </el-card>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { getTemperatureLatest, getTemperatureList } from '../api.js'

const latest = ref(null)
const tempChartRef = ref(null)
const humChartRef = ref(null)
let tempChart = null
let humChart = null

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

function formatTimestamp(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  if (isNaN(d.getTime())) return ts
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZoneName: 'short'
  }).format(d)
}

onMounted(() => {
  loadLatest()
  initCharts()
  loadHistory()
})

// Auto-refresh every 10 seconds
let refreshTimer = null
onMounted(() => {
  refreshTimer = setInterval(() => {
    loadLatest()
    loadHistory()
  }, 10000)
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
})

async function loadHistory() {
  const apiKey = localStorage.getItem('apiKey') || ''
  const deviceKey = localStorage.getItem('selectedDeviceKey') || localStorage.getItem('selectedDeviceName') || localStorage.getItem('selectedDeviceId') || ''
  if (!apiKey) return
  try {
    const params = deviceKey ? { device_key: deviceKey } : {}
    const { data } = await getTemperatureList(params, {
      headers: { 'X-API-Key': apiKey }
    })
    const records = Array.isArray(data) ? data : []
    const times = records.map(r => r.timestamp)
    const temps = records.map(r => Number(r.temperature_celsius))
    const hums = records.map(r => Number(r.humidity_percent))
    updateTempChart(times, temps)
    updateHumChart(times, hums)
  } catch (e) {
    // silently ignore
  }
}

function initCharts() {
  if (tempChartRef.value && !tempChart) {
    tempChart = echarts.init(tempChartRef.value)
  }
  if (humChartRef.value && !humChart) {
    humChart = echarts.init(humChartRef.value)
  }
  window.addEventListener('resize', handleResize)
}

function handleResize() {
  tempChart && tempChart.resize()
  humChart && humChart.resize()
}

function updateTempChart(times, temps) {
  if (!tempChart) return
  const option = {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: times },
    yAxis: { type: 'value', name: '°C' },
    series: [{ name: 'Temperature', type: 'line', data: temps, smooth: true }]
  }
  tempChart.setOption(option)
}

function updateHumChart(times, hums) {
  if (!humChart) return
  const option = {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: times },
    yAxis: { type: 'value', name: '%' },
    series: [{ name: 'Humidity', type: 'line', data: hums, smooth: true }]
  }
  humChart.setOption(option)
}
 
    function maskKey(val) {
      if (!val || typeof val !== 'string') return ''
      const s = val.trim()
      if (s.length <= 8) return s
      const start = s.slice(0, 4)
      const end = s.slice(-4)
      return `${start}****************************************${end}`
    }

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
  width: 100%;
}
.card {
  width: 100%;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.charts {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-top: 16px;
}
.chart {
  width: 100%;
  height: 300px;
}
</style>
