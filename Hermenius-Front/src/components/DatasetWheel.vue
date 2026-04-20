<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

export interface DatasetItem {
  id: string
  name: string
  meta: string
  color: string
  colorEnd: string
}

const props = defineProps<{
  datasets: DatasetItem[]
}>()

const emit = defineEmits<{
  select: [dataset: DatasetItem]
}>()

const wheelRef = ref<HTMLElement | null>(null)
const activeIndex = ref<number | null>(null)
const selectedIndex = ref<number | null>(null)

const SECTOR_ANGLE = computed(() => 360 / props.datasets.length)
const WHEEL_CENTER = 200
const INNER_RADIUS = 70
const LABEL_RADIUS = (WHEEL_CENTER + INNER_RADIUS) / 2

const conicGradient = computed(() => {
  const stops = props.datasets.map((ds, i) => {
    const start = i * SECTOR_ANGLE.value
    const end = (i + 1) * SECTOR_ANGLE.value
    return `${ds.color} ${start}deg ${end}deg`
  })
  return `conic-gradient(from 0deg, ${stops.join(', ')})`
})

const highlightGradient = computed(() => {
  if (activeIndex.value === null) return 'transparent'
  const start = activeIndex.value * SECTOR_ANGLE.value
  const end = (activeIndex.value + 1) * SECTOR_ANGLE.value
  return `conic-gradient(from 0deg, rgba(0,0,0,0.35) 0deg ${start}deg, transparent ${start}deg ${end}deg, rgba(0,0,0,0.35) ${end}deg 360deg)`
})

const labels = computed(() => {
  return props.datasets.map((dataset, index) => {
    const midAngleDeg = index * SECTOR_ANGLE.value + SECTOR_ANGLE.value / 2
    const midAngleRad = midAngleDeg * Math.PI / 180
    const x = WHEEL_CENTER + Math.sin(midAngleRad) * LABEL_RADIUS
    const y = WHEEL_CENTER - Math.cos(midAngleRad) * LABEL_RADIUS
    return {
      index,
      name: dataset.name,
      meta: dataset.meta,
      x,
      y,
      isActive: activeIndex.value === index,
    }
  })
})

const selectedName = computed(() => {
  if (selectedIndex.value !== null && props.datasets[selectedIndex.value]) {
    return props.datasets[selectedIndex.value].name
  }
  return '—'
})

function handleMouseMove(e: MouseEvent) {
  const wheel = wheelRef.value
  if (!wheel) return

  const rect = wheel.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2
  const dx = e.clientX - centerX
  const dy = e.clientY - centerY
  const distance = Math.sqrt(dx * dx + dy * dy)

  const innerBound = INNER_RADIUS * (rect.width / (WHEEL_CENTER * 2))
  if (distance < innerBound || distance > rect.width / 2) {
    activeIndex.value = null
    return
  }

  let angle = Math.atan2(dx, -dy) * (180 / Math.PI)
  if (angle < 0) angle += 360

  let sectorIndex = Math.floor(angle / SECTOR_ANGLE.value)
  if (sectorIndex >= props.datasets.length) sectorIndex = 0
  activeIndex.value = sectorIndex
}

function handleMouseLeave() {
  activeIndex.value = null
}

function handleClick() {
  if (activeIndex.value !== null) {
    selectedIndex.value = activeIndex.value
    emit('select', props.datasets[activeIndex.value])
  }
}

function setDimmed(index: number): string {
  if (activeIndex.value === null) return ''
  return index === activeIndex.value ? '' : 'opacity: 0.35;'
}
</script>

<template>
  <div class="wheel-container">
    <div
      class="wheel"
      ref="wheelRef"
      :style="{ background: conicGradient }"
      @mousemove="handleMouseMove"
      @mouseleave="handleMouseLeave"
      @click="handleClick"
    >

      <div
        style="position:absolute;top:0;left:0;width:100%;height:100%;border-radius:50%;pointer-events:none;transition:opacity 0.2s;"
        :style="{ opacity: activeIndex !== null ? 1 : 0, background: highlightGradient }"
      ></div>

      <div
        v-for="(_, i) in datasets"
        :key="'line-' + i"
        style="position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;"
        :style="{ transform: `rotate(${i * SECTOR_ANGLE}deg)`, transformOrigin: '50% 50%' }"
      >
        <div style="position:absolute;top:0;left:50%;width:2px;height:200px;background:white;transform:translateX(-50%);opacity:0.7;"></div>
      </div>

      <div
        v-for="label in labels"
        :key="'label-' + label.index"
        class="wheel-sector-label"
        :style="{
          left: label.x + 'px',
          top: label.y + 'px',
          transform: `translate(-50%, -50%) scale(${label.isActive ? 1.08 : 1})`,
          transition: 'opacity 0.2s, transform 0.2s',
          opacity: activeIndex === null || label.isActive ? 1 : 0.35,
        }"
      >
        <div class="wheel-sector-name">{{ label.name }}</div>
        <div class="wheel-sector-meta">{{ label.meta }}</div>
      </div>

      <div class="wheel-center">
        <div class="wheel-center-inner">
          <span class="wheel-label">{{ $t('select_dataset') }}</span>
          <span class="wheel-selected">{{ selectedName }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
