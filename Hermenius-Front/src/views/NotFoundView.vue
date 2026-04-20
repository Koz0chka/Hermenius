<script setup lang="ts">
import { ref, onMounted, inject } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const openThemePanel = inject<() => void>('openThemePanel')

const monolithRef = ref<HTMLElement | null>(null)

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
  <div class="page-container error-page">
    <div class="error-theme-btn">
      <button v-if="openThemePanel" class="icon-btn" @click="openThemePanel()" :title="t('themes')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      </button>
    </div>
    <main class="error-content">
      <div class="error-code">404</div>

      <div class="error-monolith" ref="monolithRef">
        <div class="error-planks">
          <div class="error-plank error-plank-left">
            <div class="error-plank-title">{{ $t('error_404') }}</div>
            <div class="error-plank-text">{{ $t('maybe_deleted') }}</div>
          </div>

          <router-link to="/" class="error-circle">
            <div class="error-circle-content">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              <span>{{ $t('back_main') }}</span>
            </div>
          </router-link>

          <div class="error-plank error-plank-right">
            <div class="error-plank-title">{{ $t('need_help') }}</div>
            <a href="mailto:hello@hermenius.ai" class="error-plank-link">{{ $t('contact_us') }}</a>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
