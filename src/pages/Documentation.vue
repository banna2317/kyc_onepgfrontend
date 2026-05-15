<script setup lang="ts">
import { computed, ref } from 'vue'
// Import data from the TS file we created
import { apis } from '../pages/data/api'
import type { ApiDoc } from '../types/api'

const selectedApi = ref<ApiDoc>(apis[0])
const activeTab = ref<'request' | 'response' | 'example'>('request')
const showSidebar = ref(false)

const openGroups = ref<Record<string, boolean>>({
  Bank: true,
  PAN: false,
  Aadhaar: false,
  Company: false,
  DL: false,
  RC: false,
  Voter: false,
})

const copy = (text: string) => {
  navigator.clipboard.writeText(text)
}

const groupedApis = computed(() => {
  return apis.reduce((acc: Record<string, ApiDoc[]>, api) => {
    if (!acc[api.category]) acc[api.category] = []
    acc[api.category].push(api)
    return acc
  }, {})
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 lg:flex">
    <!-- Sidebar -->
    <aside class="fixed inset-y-0 left-0 w-72 bg-white border-r p-4 transform transition-transform duration-300 z-40 lg:relative lg:translate-x-0"
      :class="showSidebar ? 'translate-x-0' : '-translate-x-full'">
      <h2 class="font-semibold mb-4">📚 API Documentation</h2>
      <div v-for="(group, category) in groupedApis" :key="category" class="mb-3">
        <button @click="openGroups[category] = !openGroups[category]"
          class="w-full flex justify-between px-3 py-2 rounded bg-slate-100 font-medium capitalize">
          {{ category }}
          <span>{{ openGroups[category] ? '−' : '+' }}</span>
        </button>
        <div v-if="openGroups[category]" class="mt-2 ml-2 space-y-1">
          <div v-for="api in group" :key="api.key"
            @click="selectedApi = api; activeTab = 'request'; showSidebar = false"
            class="cursor-pointer px-3 py-2 rounded text-sm" 
            :class="selectedApi.key === api.key ? 'bg-slate-900 text-white' : 'hover:bg-slate-100 text-slate-700'">
            {{ api.name }}
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 p-4 sm:p-6 lg:p-8">
      <div class="bg-white border rounded-xl shadow-sm p-6 space-y-6">
        <div>
          <h1 class="text-2xl font-bold">{{ selectedApi.name }}</h1>
          <div class="flex gap-2 mt-2">
            <span class="px-2 py-0.5 rounded text-xs bg-green-100 text-green-700">{{ selectedApi.method }}</span>
            <code class="text-sm text-slate-600">{{ selectedApi.endpoint }}</code>
          </div>
        </div>

        <div class="bg-slate-50 border rounded-lg p-4">
          <h3 class="font-semibold mb-1">Description</h3>
          <p class="text-sm text-slate-700">{{ selectedApi.description }}</p>
        </div>

        <!-- Parameters Table -->
        <div class="border rounded-lg p-4 overflow-x-auto">
          <h3 class="font-semibold mb-3">Input Parameters</h3>
          <table class="w-full text-sm border-collapse">
            <thead class="bg-slate-100">
              <tr>
                <th class="border px-3 py-2 text-left">Name</th>
                <th class="border px-3 py-2 text-left">Type</th>
                <th class="border px-3 py-2 text-left">Required</th>
                <th class="border px-3 py-2 text-left">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in selectedApi.params" :key="p.name">
                <td class="border px-3 py-2 font-mono">{{ p.name }}</td>
                <td class="border px-3 py-2">{{ p.type }}</td>
                <td class="border px-3 py-2">
                  <span :class="p.required ? 'text-red-600 bg-red-50' : 'text-slate-500'" class="px-2 py-0.5 rounded text-xs">
                    {{ p.required ? 'Yes' : 'No' }}
                  </span>
                </td>
                <td class="border px-3 py-2">{{ p.description }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Code Blocks -->
        <div class="space-y-4">
          <div class="flex gap-2">
            <button v-for="t in ['request', 'response', 'example']" :key="t" @click="activeTab = t"
              class="px-4 py-2 rounded text-sm capitalize"
              :class="activeTab === t ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'">
              {{ t }}
            </button>
          </div>
          <div class="relative">
            <button @click="copy(selectedApi[activeTab])" class="absolute top-2 right-2 text-xs bg-slate-700 text-white px-2 py-1 rounded hover:bg-slate-600">
              Copy
            </button>
            <pre class="bg-slate-900 text-white p-4 rounded-lg text-xs overflow-x-auto shadow-inner">{{ selectedApi[activeTab] }}</pre>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>