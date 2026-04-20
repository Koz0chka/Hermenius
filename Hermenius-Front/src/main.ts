import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import i18n from './i18n'

import './assets/css/style.css'
import './assets/css/register.css'
import './assets/css/profile.css'
import './assets/css/project.css'
import './assets/css/themes.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)

app.mount('#app')
