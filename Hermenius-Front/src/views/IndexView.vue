<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const { t } = useI18n()
const authStore = useAuthStore()
const monolithRef = ref<HTMLElement | null>(null)

function handleCircleClick() {
  if (authStore.isAuthenticated) {
    router.push('/profile')
  } else {
    router.push('/register')
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
  <div class="page-container">
    <section class="hero-section">
      <div class="monolith" ref="monolithRef">
        <div class="planks-container">
          <div class="plank-left-wrapper">
            <div class="plank plank-left">
              <div class="plank-content">
                <h3 class="plank-title">{{ t('documentation') }}</h3>
                <p class="plank-text">{{ t('documentation_desc') }}</p>
                <a href="#" class="plank-link">
                  <span>{{ t('open_docs') }}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div class="plank-right-wrapper">
            <div class="plank plank-right">
              <div class="plank-content">
                <h3 class="plank-title">{{ t('about') }}</h3>
                <p class="plank-text">{{ t('about_desc') }}</p>
                <router-link to="/faq" class="plank-link">
                  <span>{{ t('learn_more') }}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </router-link>
              </div>
            </div>
          </div>
        </div>

        <div class="circle-overlay">
          <a href="#" class="hero-circle" @click.prevent="handleCircleClick">
            <div class="circle-content">
              <div class="circle-logo">
                <span class="logo-hermenius">{{ t('app_name') }}</span>
              </div>
              <p class="circle-tagline">{{ t('app_tagline') }}</p>
              <div class="circle-cta">
                <span>{{ t('start_work') }}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <polyline points="19 12 12 19 5 12"></polyline>
                </svg>
              </div>
            </div>
          </a>
        </div>
      </div>
    </section>
  </div>
</template>
