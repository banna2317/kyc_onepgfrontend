<script setup lang="ts">
import { computed, ref } from 'vue'
import { apis, type ApiDoc } from '@/pages/Apidoc.vue'

const selectedApi = ref<ApiDoc>(apis[0])
const activeTab = ref<'request' | 'response' | 'example'>('request')
const showSidebar = ref(false)
const isBankOpen = ref(true)
const openGroups = ref<Record<string, boolean>>({
  Bank: true,
  PAN: false,
  Aadhaar: false,
  Company: false,
  DL: false,
  RC: false,
  Voter : false,
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

    <!-- Mobile Header -->
    <div class="lg:hidden flex items-center justify-between bg-white border-b px-4 py-3">
      <h2 class="font-semibold">📚 API Docs</h2>
      <button @click="showSidebar = !showSidebar" class="px-3 py-1 text-sm rounded bg-slate-900 text-white">
        ☰
      </button>
    </div>

    <!-- Sidebar -->
    <!-- Sidebar -->
    <aside class="fixed inset-y-0 left-0 w-72 bg-white border-r p-4 transform transition-transform duration-300 z-40
         lg:relative lg:translate-x-0
         -translate-x-full" :class="showSidebar ? 'translate-x-0' : '-translate-x-full'">
      <h2 class="font-semibold mb-4">📚 API Documentation</h2>

      <div v-for="(group, category) in groupedApis" :key="category" class="mb-3">

        <!-- Category Header -->
        <button @click="openGroups[category] = !openGroups[category]"
          class="w-full flex justify-between px-3 py-2 rounded bg-slate-100 font-medium">
          {{ category }}
          <span>{{ openGroups[category] ? '−' : '+' }}</span>
        </button>

        <!-- APIs -->
        <div v-if="openGroups[category]" class="mt-2 ml-2 space-y-1">
          <div v-for="api in group" :key="api.key"
            @click="selectedApi = api; activeTab = 'request'; showSidebar = false"
            class="cursor-pointer px-3 py-2 rounded text-sm" :class="selectedApi.key === api.key
              ? 'bg-slate-900 text-white'
              : 'hover:bg-slate-100 text-slate-700'">
            {{ api.name }}
          </div>
        </div>

      </div>
    </aside>

    <!-- Overlay for mobile -->
    <div v-if="showSidebar" class="fixed inset-0 bg-black/40 z-30 lg:hidden" @click="showSidebar = false" />

    <!-- Overlay -->
    <div v-if="showSidebar" class="fixed inset-0 bg-black/40 z-30 lg:hidden" @click="showSidebar = false" />

    <!-- Main -->
    <main class="flex-1 p-4 sm:p-6 lg:p-8">
      <div class="bg-white border rounded-xl shadow-sm p-6 space-y-6">

        <!-- Header -->
        <div>
          <h1 class="text-2xl font-bold">{{ selectedApi.name }}</h1>
          <div class="flex gap-2 mt-2">
            <span class="px-2 py-0.5 rounded text-xs bg-green-100 text-green-700">
              {{ selectedApi.method }}
            </span>
            <code class="text-sm text-slate-600">{{ selectedApi.endpoint }}</code>
          </div>
        </div>

        <!-- Description -->
        <div class="bg-slate-50 border rounded-lg p-4">
          <h3 class="font-semibold mb-1">Description</h3>
          <p class="text-sm text-slate-700">
            {{ selectedApi.description }}
          </p>
        </div>

        <!-- Requirements -->
        <div class="border rounded-lg p-4">
          <h3 class="font-semibold mb-2">Requirements</h3>
          <ul class="list-disc ml-5 text-sm text-slate-700">
            <li v-for="r in selectedApi.requirements" :key="r">{{ r }}</li>
          </ul>
        </div>

        <!-- Input Parameters -->
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
                  <span class="px-2 py-0.5 text-xs rounded" :class="p.required
                    ? 'bg-red-100 text-red-700'
                    : 'bg-slate-100 text-slate-600'">
                    {{ p.required ? 'Yes' : 'No' }}
                  </span>
                </td>
                <td class="border px-3 py-2">{{ p.description }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Tabs -->
        <div class="flex gap-2">
          <button v-for="t in ['request', 'response', 'example']" :key="t" @click="activeTab = t"
            class="px-4 py-2 rounded text-sm" :class="activeTab === t
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-700'">
            {{ t.toUpperCase() }}
          </button>
        </div>

        <!-- Code -->
        <div class="relative">
          <button class="absolute top-2 right-2 text-xs bg-slate-700 text-white px-2 py-1 rounded" @click="copy(
            activeTab === 'request'
              ? selectedApi.request
              : activeTab === 'response'
                ? selectedApi.response
                : selectedApi.example
          )">
            Copy
          </button>

          <pre class="bg-slate-900 text-white p-4 rounded-lg text-xs overflow-x-auto">
{{ activeTab === 'request'
  ? selectedApi.request
  : activeTab === 'response'
    ? selectedApi.response
    : selectedApi.example }}
          </pre>
        </div>

      </div>
    </main>
  </div>
</template>