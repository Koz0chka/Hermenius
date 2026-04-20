<script setup lang="ts">
import { ref, computed, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useAnalysisStore } from '@/stores/analysis'
import DatasetWheel from '@/components/DatasetWheel.vue'
import UploadModal from '@/components/UploadModal.vue'
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import type { DatasetItem } from '@/components/DatasetWheel.vue'

const router = useRouter()
const { t, locale } = useI18n()
const authStore = useAuthStore()
const analysisStore = useAnalysisStore()

const openThemePanel = inject<() => void>('openThemePanel')

const monolithRef = ref<HTMLElement | null>(null)
const showUpload = ref(false)
const searchQuery = ref('')
const loadingText = ref('')
const loadingSubtext = ref('')

const datasets: DatasetItem[] = [
  { id: 'iris', name: 'Iris', meta: '150 строк, 5 колонок', color: '#10b981', colorEnd: '#06b6d4' },
  { id: 'students', name: 'Students', meta: '395 строк, 33 колонок', color: '#0078e7', colorEnd: '#8b5cf6' },
  { id: 'titanic', name: 'Titanic', meta: '891 строк, 12 колонок', color: '#f59e0b', colorEnd: '#ef4444' },
]

const userName = computed(() => authStore.user?.fullname || 'User')
const userInitials = computed(() => {
  const name = authStore.user?.fullname || ''
  const words = name.split(/\s+/).filter(w => w.length > 0)
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase()
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase()
  return 'U'
})

async function handleDatasetSelect(dataset: DatasetItem) {
  loadingText.value = t('analyzing', { name: dataset.name })
  loadingSubtext.value = t('sending_api')
  analysisStore.loading = true
  try {
    await analysisStore.analyzeDataset(dataset.id, 'Nemotron', locale.value)
    if (!analysisStore.error) {
      router.push('/project')
    }
  } catch (err) {
    console.error(err)
  } finally {
    analysisStore.loading = false
  }
}

async function handleUploadSubmit(file: File, model: string) {
  loadingText.value = t('analyzing', { name: file.name })
  loadingSubtext.value = t('sending_api')
  analysisStore.loading = true
  try {
    await analysisStore.analyzeFile(file, model, locale.value)
    if (!analysisStore.error) {
      router.push('/project')
    }
  } catch (err) {
    console.error(err)
  } finally {
    analysisStore.loading = false
  }
}

onMounted(() => {
  const el = monolithRef.value
  if (!el) return
  el.style.opacity = '0'
  el.style.transform = 'translateY(30px)'
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease'
  setTimeout(() => {
    el.style.opacity = '1'
    el.style.transform = 'translateY(0)'
  }, 100)
})
</script>

<template>
  <div class="page-container profile-page">
    <header class="profile-header">
      <router-link to="/" class="back-link">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        <span>{{ t('back_main') }}</span>
      </router-link>
      <div class="user-info">
        <div class="user-avatar">{{ userInitials }}</div>
        <span class="user-name">{{ userName }}</span>
      </div>
      <button v-if="openThemePanel" class="icon-btn" @click="openThemePanel()" :title="$t('themes')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      </button>
    </header>

    <main class="profile-content">
      <div class="profile-monolith" ref="monolithRef">
        <div class="profile-planks">
          <div class="profile-plank profile-plank-left">
            <div class="profile-plank-content">
              <h3 class="profile-plank-title">{{ t('new_project') }}</h3>
              <p class="profile-plank-text">{{ t('new_project_desc') }}</p>
              <button class="profile-plank-btn" @click="showUpload = true">{{ t('create') }}</button>
            </div>
          </div>

          <div class="profile-plank profile-plank-right">
            <div class="profile-plank-content">
              <h3 class="profile-plank-title">{{ t('search') }}</h3>
              <p class="profile-plank-text">Быстрый поиск по готовым датасетам</p>
              <div class="search-box">
                <input
                  type="text"
                  v-model="searchQuery"
                  :placeholder="t('search_placeholder')"
                  class="search-input"
                >
              </div>
            </div>
          </div>
        </div>

        <DatasetWheel :datasets="datasets" @select="handleDatasetSelect" />
      </div>
    </main>

    <UploadModal
      :visible="showUpload"
      @update:visible="showUpload = $event"
      @submit="handleUploadSubmit"
    />

    <LoadingOverlay
      :visible="analysisStore.loading"
      :text="loadingText"
      :subtext="loadingSubtext"
    />
  </div>
</template>
