<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  visible: boolean
  position: { top: number; left: number }
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  export: [action: string]
}>()

const { t } = useI18n()

function handleAction(action: string) {
  emit('export', action)
  emit('update:visible', false)
}

function handleClickOutside(e: MouseEvent) {
  const el = document.getElementById('floating-export-menu')
  if (el && !el.contains(e.target as Node)) {
    emit('update:visible', false)
  }
}

function handleEscape(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    emit('update:visible', false)
  }
}

onMounted(() => {
  if (props.visible) {
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
  }
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  document.removeEventListener('keydown', handleEscape)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      id="floating-export-menu"
      style="position:fixed;z-index:999999;min-width:220px;padding:0.5rem;
        background:var(--bg-card);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);
        border-radius:12px;border:1px solid var(--border-color);
        box-shadow:0 -8px 40px rgba(0,0,0,0.22);font-family:inherit;"
      :style="{ top: position.top + 'px', left: position.left + 'px' }"
    >
      <div class="export-dropdown-label">{{ t('export_current') }}</div>

      <button class="export-dropdown-item" @click="handleAction('png')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2"></rect>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        {{ t('export_png') }}
      </button>

      <button class="export-dropdown-item" @click="handleAction('svg')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="16 18 22 12 16 6"></polyline>
          <polyline points="8 6 2 12 8 18"></polyline>
        </svg>
        {{ t('export_svg') }}
      </button>

      <div class="export-dropdown-separator"></div>

      <div class="export-dropdown-label">{{ t('export_all') }}</div>

      <button class="export-dropdown-item" @click="handleAction('html')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="16 18 22 12 16 6"></polyline>
          <polyline points="8 6 2 12 8 18"></polyline>
        </svg>
        {{ t('export_html') }}
      </button>

      <button class="export-dropdown-item" @click="handleAction('pdf')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
        </svg>
        {{ t('export_pdf') }}
      </button>

      <button class="export-dropdown-item" @click="handleAction('dashboard-png')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
        Dashboard PNG
      </button>
    </div>
  </Teleport>
</template>
