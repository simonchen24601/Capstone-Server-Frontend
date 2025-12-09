<template>
  <aside class="left-dock">
    <div class="title">Devices</div>

    <div class="api-key">
      <el-input
        v-model="apiKey"
        placeholder="Enter API key"
        clearable
        size="small"
      />
      <el-button size="small" type="primary" @click="fetchDevices" :loading="loading">
        Load
      </el-button>
    </div>

    <div class="devices">
      <el-empty v-if="!loading && devices.length === 0" description="No devices" />
      <el-menu
        v-else
        class="menu"
        :default-active="selectedDeviceName || devices[0] || ''"
        @select="selectDevice"
      >
        <el-menu-item v-for="d in devices" :key="d" :index="d">
          {{ d }}
        </el-menu-item>
      </el-menu>
    </div>
  </aside>
  </template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getDevices } from '../api.js'

const apiKey = ref(localStorage.getItem('apiKey') || '')
const devices = ref([])
const loading = ref(false)
const selectedDeviceName = ref(localStorage.getItem('selectedDeviceKey') || localStorage.getItem('selectedDeviceName') || localStorage.getItem('selectedDeviceId') || '')

async function fetchDevices() {
  if (!apiKey.value) {
    ElMessage.warning('Please enter API key')
    return
  }
  localStorage.setItem('apiKey', apiKey.value)
  loading.value = true
  try {
    const { data } = await getDevices({
      headers: { 'X-API-Key': apiKey.value }
    })
    devices.value = Array.isArray(data) ? data : []
  } catch (e) {
    devices.value = []
    ElMessage.error('Failed to load devices')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (apiKey.value) fetchDevices()
})

function selectDevice(index) {
  selectedDeviceName.value = index
  localStorage.setItem('selectedDeviceKey', index)
  localStorage.setItem('selectedDeviceName', index)
  localStorage.setItem('selectedDeviceId', index)
  ElMessage.success(`Selected device: ${index}`)
}
</script>

<style scoped>
.left-dock {
  width: 240px;
  min-width: 240px;
  height: 100vh;
  padding: 12px;
  border-right: 1px solid var(--vt-c-divider);
  background: var(--vt-c-black-mute);
  position: sticky;
  top: 0;
  overflow: auto;
}
.title {
  font-weight: 600;
  margin-bottom: 8px;
}
.menu {
  border-right: none;
}
.api-key {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}
.devices {
  overflow: autovue;
  max-height: calc(100vh - 100px);
}
</style>
