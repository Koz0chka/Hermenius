<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useThemeStore, THEMES } from '@/stores/theme'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const { t } = useI18n()
const themeStore = useThemeStore()

function applyTheme(themeId: string) {
  themeStore.applyTheme(themeId)
}

function close() {
  emit('update:visible', false)
}

function handleOverlayClick(e: MouseEvent) {
  if ((e.target as HTMLElement).classList.contains('theme-panel-overlay')) {
    close()
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      class="theme-panel-overlay"
      :class="{ active: visible }"
      @click="handleOverlayClick"
    >
      <div class="theme-panel">
        <div class="theme-panel-header">
          <h2 class="theme-panel-title">{{ t('themes') }}</h2>
          <button class="theme-panel-close" @click="close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="theme-grid">
          <div
            v-for="theme in themeStore.themeList"
            :key="theme.id"
            class="theme-option"
            :class="{ active: themeStore.currentTheme === theme.id }"
            @click="applyTheme(theme.id)"
          >
            <div class="theme-option-icon">{{ theme.icon }}</div>
            <div class="theme-option-name">{{ t(theme.name) }}</div>
            <div class="theme-option-check">✓</div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
