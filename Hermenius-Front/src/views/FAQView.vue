<script setup lang="ts">
import { inject } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const openThemePanel = inject<() => void>('openThemePanel')
</script>

<template>
  <div class="scroll-container">
    <header class="faq-header">
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

    <section class="section faq-hero-section">
      <div class="section-content">
        <h1 class="page-title">{{ $t('faq_title') }}</h1>
        <p class="page-subtitle">{{ $t('faq_subtitle') }}</p>
      </div>
      <div class="scroll-indicator">
        <span>Листайте вниз</span>
        <div class="arrow-down"></div>
      </div>
    </section>

    <section class="section faq-section">
      <div class="section-content">
        <h2 class="section-title">{{ $t('getting_started') }}</h2>
        <div class="faq-list">
          <div class="faq-item">
            <h3 class="faq-question">Какие форматы данных поддерживаются?</h3>
            <p class="faq-answer">CSV, Excel, JSON, Parquet, а также прямые подключения к PostgreSQL, MySQL, ClickHouse, MongoDB и 50+ другим источникам данных.</p>
          </div>
          <div class="faq-item">
            <h3 class="faq-question">Нужно ли обучать модель?</h3>
            <p class="faq-answer">Нет, наш ИИ работает сразу «из коробки». Он автоматически адаптируется под структуру ваших данных и типы показателей.</p>
          </div>
          <div class="faq-item">
            <h3 class="faq-question">Можно ли попробовать бесплатно?</h3>
            <p class="faq-answer">Да, у нас есть бесплатный тариф на 100 000 строк в месяц без ограничения по времени использования. Также доступен пробный период 14 дней для платных тарифов.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section faq-section">
      <div class="section-content">
        <h2 class="section-title">{{ $t('security') }}</h2>
        <div class="faq-list">
          <div class="faq-item">
            <h3 class="faq-question">Как обеспечивается безопасность данных?</h3>
            <p class="faq-answer">Шифрование AES-256, SSL/TLS для передачи данных, двухфакторная аутентификация, ролевая модель доступа и полный аудит действий пользователей.</p>
          </div>
          <div class="faq-item">
            <h3 class="faq-question">Можно ли развернуть на собственных серверах?</h3>
            <p class="faq-answer">Да, для Enterprise-тарифа доступен On-premise вариант развертывания. Мы предоставляем Docker-образы и полную поддержку инсталляции.</p>
          </div>
          <div class="faq-item">
            <h3 class="faq-question">Какие интеграции доступны?</h3>
            <p class="faq-answer">Более 50 интеграций: PostgreSQL, MySQL, ClickHouse, MongoDB, BigQuery, Snowflake, Google Analytics, Яндекс.Метрика и многие другие.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section faq-section">
      <div class="section-content">
        <h2 class="section-title">{{ $t('pricing') }}</h2>
        <div class="faq-list">
          <div class="faq-item">
            <h3 class="faq-question">Какие тарифы доступны?</h3>
            <p class="faq-answer">Стартовый (бесплатный), Бизнес (1 999 ₽/мес) и Enterprise (индивидуально). Каждый тариф включает разные объёмы данных и функционал.</p>
          </div>
          <div class="faq-item">
            <h3 class="faq-question">Можно ли сменить тариф?</h3>
            <p class="faq-answer">Да, вы можете перейти на более высокий тариф в любой момент. При понижении тарифа изменения вступят в силу в следующем расчётном периоде.</p>
          </div>
          <div class="faq-item">
            <h3 class="faq-question">Какие способы оплаты доступны?</h3>
            <p class="faq-answer">Банковские карты, расчётный счёт для юрлиц, СБП. Для Enterprise-клиентов возможна безналичная оплата по договору.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section contacts-section">
      <div class="section-content">
        <h2 class="section-title">{{ $t('contacts') }}</h2>

        <div class="contacts-grid">
          <div class="contact-card">
            <div class="contact-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </div>
            <h3 class="contact-title">Email</h3>
            <a href="mailto:hello@hermenius.ai" class="contact-link">hello@hermenius.ai</a>
            <p class="contact-text">Ответим в течение 24 часов</p>
          </div>

          <div class="contact-card">
            <div class="contact-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
            </div>
            <h3 class="contact-title">Телефон</h3>
            <a href="tel:+79991234567" class="contact-link">+7 (999) 123-45-67</a>
            <p class="contact-text">Пн-Пт с 10:00 до 19:00 МСК</p>
          </div>

          <div class="contact-card">
            <div class="contact-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <h3 class="contact-title">Поддержка</h3>
            <a href="mailto:support@hermenius.ai" class="contact-link">support@hermenius.ai</a>
            <p class="contact-text">Технические вопросы</p>
          </div>
        </div>

        <div class="social-links">
          <a href="https://memepedia.ru/wp-content/uploads/2017/05/%D0%BC%D0%B0%D0%BA%D1%81-%D0%B8%D0%B4%D0%B8-%D0%BD%D0%B0%D1%85%D1%83%D0%B9.jpg" class="social-link">MAX</a>
          <a href="https://github.com/Koz0chka/Hermenius" class="social-link">GitHub</a>
          <a href="https://memepedia.ru/wp-content/uploads/2017/05/%D0%BC%D0%B0%D0%BA%D1%81-%D0%B8%D0%B4%D0%B8-%D0%BD%D0%B0%D1%85%D1%83%D0%B9.jpg" class="social-link">VK</a>
        </div>
      </div>
    </section>

    <section class="section footer-section">
      <div class="section-content">
        <footer class="footer-card">
          <div class="footer-content">
            <div class="footer-logo">
              <span class="logo-hermenius">Hermenius</span>
            </div>
            <p class="footer-copyright">
              © 2026 Hermenius. Все права защищены.
            </p>
            <div class="footer-links">
              <router-link to="/" class="footer-link">Главная</router-link>
              <router-link to="/profile" class="footer-link">Проекты</router-link>
              <router-link to="/faq" class="footer-link">FAQ</router-link>
            </div>
          </div>
        </footer>
      </div>
    </section>
  </div>
</template>
