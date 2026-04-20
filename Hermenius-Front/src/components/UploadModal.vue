<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  submit: [file: File, model: string]
}>()

const { t } = useI18n()

const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const selectedModel = ref('Nemotron')
const isDragOver = ref(false)

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' Б'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' КБ'
  return (bytes / (1024 * 1024)).toFixed(1) + ' МБ'
}

const fileSize = ref('—')
const fileName = ref('—')
const fileSelected = ref(false)

function openFileInput() {
  fileInput.value?.click()
}

function handleFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    setFile(input.files[0])
  }
}

function setFile(file: File) {
  selectedFile.value = file
  fileName.value = file.name
  fileSize.value = formatFileSize(file.size)
  fileSelected.value = true
}

function handleDragOver(e: DragEvent) {
  e.preventDefault()
  isDragOver.value = true
}

function handleDragLeave() {
  isDragOver.value = false
}

function handleDrop(e: DragEvent) {
  e.preventDefault()
  isDragOver.value = false
  if (e.dataTransfer && e.dataTransfer.files.length > 0) {
    setFile(e.dataTransfer.files[0])
  }
}

function handleAnalyze() {
  if (!selectedFile.value) return
  emit('submit', selectedFile.value, selectedModel.value)
  close()
}

function close() {
  emit('update:visible', false)
  reset()
}

function reset() {
  selectedFile.value = null
  fileSelected.value = false
  fileName.value = '—'
  fileSize.value = '—'
  selectedModel.value = 'Nemotron'
  if (fileInput.value) fileInput.value.value = ''
}

function handleOverlayClick(e: MouseEvent) {
  if ((e.target as HTMLElement).classList.contains('upload-modal-overlay')) {
    close()
  }
}

watch(() => props.visible, (val) => {
  if (val) reset()
})
</script>

<template>
  <Teleport to="body">
    <div
      class="upload-modal-overlay"
      :class="{ active: visible }"
      @click="handleOverlayClick"
    >
      <div class="upload-modal">
        <div class="upload-modal-header">
          <h2 class="upload-modal-title">{{ t('upload_title') }}</h2>
          <button class="upload-modal-close" @click="close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div
          class="upload-zone"
          :class="{ dragover: isDragOver }"
          :style="{ display: fileSelected ? 'none' : '' }"
          @click="openFileInput"
          @dragover="handleDragOver"
          @dragleave="handleDragLeave"
          @drop="handleDrop"
        >
          <div class="upload-zone-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
          </div>
          <div class="upload-zone-text">{{ t('upload_drag') }}</div>
          <div class="upload-zone-hint">{{ t('upload_click') }}</div>
          <input
            ref="fileInput"
            type="file"
            class="upload-zone-input"
            accept=".csv,.xlsx,.json,.parquet"
            @change="handleFileChange"
          >
        </div>

        <div class="upload-file-info" :class="{ visible: fileSelected }">
          <div class="upload-file-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
          </div>
          <div>
            <div class="upload-file-name">{{ fileName }}</div>
            <div class="upload-file-size">{{ fileSize }}</div>
          </div>
        </div>

        <div class="upload-model-select">
          <label class="upload-model-label">{{ t('upload_model') }}</label>
          <select class="upload-model-field" v-model="selectedModel">
            <optgroup label="NVIDIA">
              <option value="Nemotron">Nemotron (120B / 30B)</option>
            </optgroup>
            <optgroup label="Z-AI">
              <option value="Z-AI">GLM-4.5 Air</option>
            </optgroup>
            <optgroup label="Google">
              <option value="Gemma">Gemma (31B / 26B / 27B)</option>
            </optgroup>
            <optgroup label="OpenAI">
              <option value="OpenAI">GPT-OSS (120B / 20B)</option>
            </optgroup>
            <optgroup label="Alibaba">
              <option value="Qwen">Qwen (80B / Coder)</option>
            </optgroup>
            <optgroup label="Meta">
              <option value="Llama">Llama 3.3 70B</option>
            </optgroup>
            <optgroup label="NousResearch">
              <option value="Nous">Hermes 405B</option>
            </optgroup>
          </select>
        </div>

        <div class="upload-actions">
          <button
            class="upload-btn upload-btn-primary"
            :disabled="!fileSelected"
            @click="handleAnalyze"
          >{{ t('analyze') }}</button>
          <button class="upload-btn upload-btn-secondary" @click="close">{{ t('cancel') }}</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
