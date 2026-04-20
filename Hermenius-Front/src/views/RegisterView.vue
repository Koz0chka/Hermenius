<script setup lang="ts">
import { ref, reactive, onMounted, inject } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const authStore = useAuthStore()

const openThemePanel = inject<() => void>('openThemePanel')

const cardRef = ref<HTMLElement | null>(null)

const form = reactive({
  fullname: '',
  email: '',
  phone: '',
  company: '',
  agreement: false,
})

const errors = reactive<Record<string, string>>({})

const patterns = {
  fullname: /^[а-яёА-ЯЁa-zA-Z\s\-]+$/,
  phone: /^(\+7|8)[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}$/,
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  company: /^[а-яёА-ЯЁa-zA-Z0-9\s\-.,&]+$/,
}

function formatPhone(e: Event) {
  const input = e.target as HTMLInputElement
  let value = input.value.replace(/\D/g, '')
  if (value.length > 11) value = value.slice(0, 11)

  let formatted = ''
  if (value.length > 0) {
    formatted = value[0] === '8' ? '+7' : '+' + value[0]
    if (value.length > 1) formatted += ' (' + value.slice(1, 4)
    if (value.length > 4) formatted += ') ' + value.slice(4, 7)
    if (value.length > 7) formatted += '-' + value.slice(7, 9)
    if (value.length > 9) formatted += '-' + value.slice(9, 11)
  }
  input.value = formatted
  form.phone = formatted
  clearError('phone')
}

function clearError(field: string) {
  delete errors[field]
}

function clearFieldError(field: string) {
  delete errors[field]
}

function handleSubmit(e: Event) {
  e.preventDefault()
  Object.keys(errors).forEach(k => delete errors[k])

  let isValid = true

  const fullnameWords = form.fullname.trim().split(/\s+/).filter(w => w.length > 0)
  if (form.fullname.trim() === '') {
    errors.fullname = 'Введите ФИО'
    isValid = false
  } else if (!patterns.fullname.test(form.fullname.trim())) {
    errors.fullname = 'ФИО должно содержать только буквы'
    isValid = false
  } else if (fullnameWords.length < 2) {
    errors.fullname = 'Введите минимум фамилию и имя'
    isValid = false
  } else if (fullnameWords.length > 3) {
    errors.fullname = 'Максимум 3 слова'
    isValid = false
  }

  if (form.email.trim() === '') {
    errors.email = 'Введите email'
    isValid = false
  } else if (!patterns.email.test(form.email.trim())) {
    errors.email = 'Введите корректный email'
    isValid = false
  }

  const phoneDigits = form.phone.replace(/\D/g, '')
  if (form.phone.trim() === '') {
    errors.phone = 'Введите номер телефона'
    isValid = false
  } else if (!patterns.phone.test(form.phone.trim())) {
    errors.phone = 'Формат: +7 (XXX) XXX-XX-XX'
    isValid = false
  } else if (phoneDigits.length !== 11) {
    errors.phone = 'Номер должен содержать 11 цифр'
    isValid = false
  }

  if (form.company.trim() !== '' && !patterns.company.test(form.company.trim())) {
    errors.company = 'Недопустимые символы'
    isValid = false
  }

  if (!form.agreement) {
    errors.agreement = 'Необходимо согласие на обработку данных'
    isValid = false
  }

  if (isValid) {
    authStore.register({
      fullname: form.fullname.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      company: form.company.trim(),
    })
    const redirect = (route.query.redirect as string) || '/profile'
    setTimeout(() => router.push(redirect), 300)
  }
}

function handleReset() {
  form.fullname = ''
  form.email = ''
  form.phone = ''
  form.company = ''
  form.agreement = false
  Object.keys(errors).forEach(k => delete errors[k])
}

onMounted(() => {
  const el = cardRef.value
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
  <div class="page-container register-page">
    <header class="register-header">
      <router-link to="/" class="back-link">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        <span>{{ t('back_main') }}</span>
      </router-link>
      <button v-if="openThemePanel" class="icon-btn" @click="openThemePanel()" :title="t('themes')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      </button>
    </header>

    <main class="register-content">
      <div class="register-card" ref="cardRef">
        <div class="register-header-inner">
          <div class="register-logo">
            <span class="logo-hermenius">{{ t('app_name') }}</span>
          </div>
          <h1 class="register-title">{{ t('register_title') }}</h1>
          <p class="register-subtitle">{{ t('register_subtitle') }}</p>
        </div>

        <form class="register-form" @submit="handleSubmit" @reset="handleReset">

          <div class="form-field">
            <label class="form-label" for="fullname">
              {{ t('fullname') }} <span class="required">*</span>
            </label>
            <div class="form-input-wrapper">
              <input type="text" id="fullname" v-model="form.fullname" class="form-input"
                     :class="{ 'is-danger': errors.fullname }"
                     placeholder="Иванов Иван Иванович" autocomplete="name"
                     @input="clearFieldError('fullname')">
              <span class="form-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </span>
            </div>
            <p class="form-help" :class="{ 'is-danger': errors.fullname }">
              {{ errors.fullname || 'Введите фамилию, имя и отчество' }}
            </p>
          </div>

          <div class="form-field">
            <label class="form-label" for="email">
              {{ t('email') }} <span class="required">*</span>
            </label>
            <div class="form-input-wrapper">
              <input type="email" id="email" v-model="form.email" class="form-input"
                     :class="{ 'is-danger': errors.email }"
                     placeholder="example@company.ru" autocomplete="email"
                     @input="clearFieldError('email')">
              <span class="form-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </span>
            </div>
            <p class="form-help" :class="{ 'is-danger': errors.email }">
              {{ errors.email || 'Корпоративный email для доступа' }}
            </p>
          </div>

          <div class="form-field">
            <label class="form-label" for="phone">
              {{ t('phone') }} <span class="required">*</span>
            </label>
            <div class="form-input-wrapper">
              <input type="tel" id="phone" :value="form.phone" class="form-input"
                     :class="{ 'is-danger': errors.phone }"
                     placeholder="+7 (999) 123-45-67" autocomplete="tel"
                     @input="formatPhone">
              <span class="form-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
              </span>
            </div>
            <p class="form-help" :class="{ 'is-danger': errors.phone }">
              {{ errors.phone || 'Формат: +7 (XXX) XXX-XX-XX' }}
            </p>
          </div>

          <div class="form-field">
            <label class="form-label" for="company">{{ t('company') }}</label>
            <div class="form-input-wrapper">
              <input type="text" id="company" v-model="form.company" class="form-input"
                     :class="{ 'is-danger': errors.company }"
                     placeholder="Название компании" autocomplete="organization"
                     @input="clearFieldError('company')">
              <span class="form-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              </span>
            </div>
            <p class="form-help" :class="{ 'is-danger': errors.company }">
              {{ errors.company || 'Необязательно' }}
            </p>
          </div>

          <div class="form-field form-checkbox-field">
            <label class="form-checkbox">
              <input type="checkbox" v-model="form.agreement" id="agreement">
              <span class="checkbox-mark"></span>
              <span class="checkbox-label">
                {{ t('agree') }}
              </span>
            </label>
            <p v-if="errors.agreement" class="form-help is-danger">{{ errors.agreement }}</p>
          </div>

          <div class="form-actions">
            <button type="submit" class="form-btn form-btn-primary">
              <span>{{ t('register_btn') }}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
            <button type="reset" class="form-btn form-btn-secondary">{{ t('clear_btn') }}</button>
          </div>

        </form>

        <div class="register-footer">
          <p>{{ t('have_account') }} <router-link to="/register" class="form-link">{{ t('login') }}</router-link></p>
        </div>

      </div>
    </main>
  </div>
</template>
