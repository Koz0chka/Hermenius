<script setup lang="ts">
withDefaults(defineProps<{
  visible: boolean
  text: string
  subtext: string
}>(), {
  visible: false,
  text: '',
  subtext: '',
})
</script>

<template>
  <div v-if="visible" class="loading-overlay">
    <div class="loading-spinner"></div>
    <div v-if="text" class="loading-text">{{ text }}</div>
    <div v-if="subtext" class="loading-subtext">{{ subtext }}</div>
  </div>
</template>
