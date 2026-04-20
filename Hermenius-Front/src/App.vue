<script setup lang="ts">
import { ref, onMounted, provide } from 'vue'
import { RouterView } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import ThemePanel from '@/components/ThemePanel.vue'

const themeStore = useThemeStore()

onMounted(() => {
  themeStore.init()
})

const showGlobalThemePanel = ref(false)

function openThemePanel() {
  showGlobalThemePanel.value = true
}

provide<() => void>('openThemePanel', openThemePanel)
</script>

<template>
  <RouterView v-slot="{ Component, route }">
    <Transition name="page" mode="out-in">
      <component :is="Component" :key="route.path" />
    </Transition>
  </RouterView>

  <ThemePanel
    :visible="showGlobalThemePanel"
    @update:visible="showGlobalThemePanel = $event"
  />
</template>

<style scoped>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>
