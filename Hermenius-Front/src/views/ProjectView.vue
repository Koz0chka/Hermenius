<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAnalysisStore } from '@/stores/analysis'
import { useThemeStore } from '@/stores/theme'
import ThemePanel from '@/components/ThemePanel.vue'
import ExportMenu from '@/components/ExportMenu.vue'
import type { PlotData } from '@/stores/analysis'
import Plotly from 'plotly.js-dist-min'

const router = useRouter()
const { t: translate, locale } = useI18n()
const analysisStore = useAnalysisStore()
const themeStore = useThemeStore()

const showThemePanel = ref(false)
const showExportMenu = ref(false)
const exportPosition = ref({ top: 0, left: 0 })
const focusedPlotId = ref<string | null>(null)
const focusedPlotEl = ref<HTMLDivElement | null>(null)

const cardSpans = ref<Record<number, { col: number; row: number }>>({})

const projectTitle = computed(() => {
  return analysisStore.result?.fileInfo?.filename || translate('app_name')
})

const keyMetrics = computed(() => {
  const r = analysisStore.result
  if (!r) return []
  return [
    { label: translate('rows'), value: String(r.fileInfo.rows), color: 'var(--accent-primary)' },
    { label: translate('columns'), value: String(r.fileInfo.columns), color: 'var(--accent-primary)' },
    { label: translate('time'), value: r.processingTime.toFixed(1) + ' ' + translate('sec'), color: 'var(--accent-primary)' },
  ]
})

const plots = computed(() => {
  const all = analysisStore.result?.plots || []
  return all.filter((p: PlotData) => p.traces && p.traces.length > 0)
})
const insights = computed(() => analysisStore.result?.insights || [])
const hasData = computed(() => plots.value.length > 0)
const filteredCount = computed(() => {
  const all = analysisStore.result?.plots || []
  return all.length - plots.value.length
})
const hasError = computed(() => analysisStore.result?.status === 'error' && !hasData.value)
const errorMessage = computed(() => analysisStore.result?.message || '')
const fileInfo = computed(() => analysisStore.result?.fileInfo)


function defaultSpan(plot: PlotData, type: 'col' | 'row'): number {
  if (type === 'col') {
    if (['heatmap', 'scatter', 'line', 'violin'].includes(plot.type)) return 2
    return 1
  }
  if (type === 'row') {
    if (['heatmap', 'scatter', 'line', 'violin'].includes(plot.type)) return 3
    if (['pie', 'boxplot'].includes(plot.type)) return 3
    return 2
  }
  return 1
}

function getCardSpan(plot: PlotData, type: 'col' | 'row', index: number): number {
  const custom = cardSpans.value[index]
  if (custom) return type === 'col' ? custom.col : custom.row
  return defaultSpan(plot, type)
}

function handleCardClick(index: number) {
  focusedPlotId.value = 'plot-' + index
  const el = document.getElementById('plot-' + index)
  focusedPlotEl.value = el as HTMLDivElement | null
}

function handleExportToggle(e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const menuH = 280
  const menuW = 220
  let top = rect.top - menuH - 10
  let left = rect.left
  if (top < 10) top = rect.bottom + 10
  if (left + menuW > window.innerWidth - 10) left = window.innerWidth - menuW - 10
  if (left < 10) left = 10
  exportPosition.value = { top, left }
  showExportMenu.value = !showExportMenu.value
}


async function handleExportAction(action: string) {
  if (action === 'png' || action === 'svg') {
    const plotId = focusedPlotId.value || 'plot-0'
    const el = document.getElementById(plotId)
    if (el) {
      Plotly.toImage(el, { format: action as 'png' | 'svg', width: 1600, height: 900 }).then((url: string) => {
        const a = document.createElement('a')
        a.href = url
        a.download = `hermenius-chart.${action}`
        a.click()
      })
    }
    return
  }
  if (action === 'html') { await exportDashboardHTML(); return }
  if (action === 'pdf') { exportDashboardPDF(); return }
  if (action === 'dashboard-png') { await exportDashboardPNG(); return }
}

function toggleLang() {
  locale.value = locale.value === 'ru' ? 'en' : 'ru'
}

const regenerating = ref(false)

async function handleRegenerate() {
  if (regenerating.value || !analysisStore.canRegenerate) return
  regenerating.value = true
  try {
    await analysisStore.regenerate()
  } finally {
    regenerating.value = false
  }
}

function handleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {})
  } else {
    document.exitFullscreen().catch(() => {})
  }
}

function handleDownloadChart(index: number, plot: PlotData) {
  const el = document.getElementById('plot-' + index)
  if (!el) return
  Plotly.toImage(el, { format: 'png', width: 1600, height: 900 }).then((url: string) => {
    const a = document.createElement('a')
    a.href = url
    a.download = (plot.title || 'chart') + '.png'
    a.click()
  })
}

function renderBoxplotTable(plot: PlotData): string {
  const raw = plot.rawData
  if (!raw) return ''
  const labels = (raw.labels as string[]) || []
  const datasets = (raw.datasets as Record<string, number>[]) || []
  if (labels.length === 0 || datasets.length === 0) return ''

  let html = '<table class="box-table"><thead><tr>'
  html += '<th>Group</th><th>Min</th><th>Q1</th><th>Median</th><th>Q3</th><th>Max</th>'
  html += '</tr></thead><tbody>'
  for (let i = 0; i < datasets.length; i++) {
    const ds = datasets[i]
    html += '<tr>'
    html += `<td>${labels[i] || i + 1}</td>`
    html += `<td>${ds.min ?? ''}</td>`
    html += `<td>${ds.q1 ?? ''}</td>`
    html += `<td>${ds.median ?? ''}</td>`
    html += `<td>${ds.q3 ?? ''}</td>`
    html += `<td>${ds.max ?? ''}</td>`
    html += '</tr>'
  }
  html += '</tbody></table>'
  return html
}


async function renderPlots() {
  await nextTick()
  const cfg = themeStore.getPlotlyConfig()
  const currentPlots = plots.value

  for (let i = 0; i < currentPlots.length; i++) {
    const plot = currentPlots[i]
    if (plot.type === 'boxplot') continue
    const el = document.getElementById('plot-' + i)
    if (!el || plot.traces.length === 0) continue

    try {
      const themedTraces = plot.traces.map((trace: any, ti: number) => {
        const tr: any = { ...trace }
        const color = cfg.colors[ti % cfg.colors.length]
        if (tr.marker) {
          tr.marker = { ...tr.marker, color }
        }
        if (tr.line) {
          tr.line = { ...tr.line, color }
        }
        if (tr.type === 'heatmap' && cfg.colorscale_heatmap) {
          tr.colorscale = cfg.colorscale_heatmap
        }
        if (tr.type === 'pie' || tr.type === 'sunburst') {
          const sliceCount = (tr.labels as string[])?.length || 8
          const baseColors = cfg.colors || ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#f97316']
          const pieColors: string[] = []
          for (let s = 0; s < sliceCount; s++) {
            pieColors.push(baseColors[s % baseColors.length])
          }
          tr.marker = { ...tr.marker, colors: pieColors }
        }
        return tr
      })

      const themedLayout: any = {
        ...plot.layout,
        autosize: true,
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: { ...(plot.layout as any).font, color: cfg.font_color },
      }

      if (!themedLayout.xaxis) themedLayout.xaxis = {}
      themedLayout.xaxis.gridcolor = cfg.grid_color
      themedLayout.xaxis.zerolinecolor = cfg.zeroline_color
      themedLayout.xaxis.color = cfg.font_color
      if (!themedLayout.yaxis) themedLayout.yaxis = {}
      themedLayout.yaxis.gridcolor = cfg.grid_color
      themedLayout.yaxis.zerolinecolor = cfg.zeroline_color
      themedLayout.yaxis.color = cfg.font_color
      if (themedLayout.showlegend !== false) {
        themedLayout.legend = { ...(themedLayout.legend || {}), font: { color: cfg.font_color } }
      }
      if (plot.type === 'pie') {
        themedLayout.margin = { l: 10, r: 10, t: 40, b: 10 }
        themedLayout.xaxis = { visible: false }
        themedLayout.yaxis = { visible: false }
      }

      Plotly.react(el, themedTraces, themedLayout, {
        responsive: false,
        displayModeBar: false,
      })
      Plotly.Plots.resize(el)
    } catch (err) {
      console.warn(`Failed to render plot ${i}:`, err)
    }
  }
}


function resizeAllPlots() {
  const currentPlots = plots.value
  for (let i = 0; i < currentPlots.length; i++) {
    if (currentPlots[i].type === 'boxplot') continue
    const el = document.getElementById('plot-' + i)
    if (el) {
      try { Plotly.Plots.resize(el) } catch { /* ignore */ }
    }
  }
}


watch(plots, () => {
  if (plots.value.length > 0) renderPlots()
}, { immediate: true })

watch(() => themeStore.currentTheme, () => {
  if (plots.value.length > 0) renderPlots()
})

let resizeHandler: (() => void) | null = null

onMounted(() => {
  resizeHandler = () => resizeAllPlots()
  window.addEventListener('resize', resizeHandler)
  initDragAndDrop()
})

onUnmounted(() => {
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler)
    resizeHandler = null
  }
})


const dragSrcIndex = ref<number | null>(null)

function initDragAndDrop() {
  const grid = document.getElementById('dashboardGrid')
  if (!grid) return

  grid.addEventListener('dragstart', (e: DragEvent) => {
    const card = (e.target as HTMLElement).closest('.dash-card') as HTMLElement | null
    if (!card) return
    dragSrcIndex.value = Number(card.dataset.plotIndex)
    card.classList.add('dragging')
    e.dataTransfer!.effectAllowed = 'move'
  })

  grid.addEventListener('dragend', (e: DragEvent) => {
    const card = (e.target as HTMLElement).closest('.dash-card') as HTMLElement | null
    if (card) card.classList.remove('dragging')
    document.querySelectorAll('.drag-placeholder').forEach(el => el.remove())
    dragSrcIndex.value = null
  })

  grid.addEventListener('dragover', (e: DragEvent) => {
    e.preventDefault()
    e.dataTransfer!.dropEffect = 'move'
  })

  grid.addEventListener('drop', (e: DragEvent) => {
    e.preventDefault()
    const card = (e.target as HTMLElement).closest('.dash-card') as HTMLElement | null
    if (!card || dragSrcIndex.value === null) return
    const targetIndex = Number(card.dataset.plotIndex)
    if (targetIndex === dragSrcIndex.value) return

    const store = analysisStore.result
    if (!store) return
    const arr = store.plots
    const [moved] = arr.splice(dragSrcIndex.value, 1)
    arr.splice(targetIndex, 0, moved)
    analysisStore.result = { ...store }
    const oldSpans = { ...cardSpans.value }
    cardSpans.value = {}
    for (const [oldIdx, span] of Object.entries(oldSpans)) {
      const oi = Number(oldIdx)
      const newIdx = oi === dragSrcIndex.value
        ? targetIndex
        : oi > dragSrcIndex.value && oi <= targetIndex
          ? oi - 1
          : oi < dragSrcIndex.value && oi >= targetIndex
            ? oi + 1
            : oi
      cardSpans.value[newIdx] = span
    }

    nextTick(() => {
      setTimeout(() => resizeAllPlots(), 50)
    })
  })
}


function handleResizeStart(e: MouseEvent, index: number) {
  e.preventDefault()
  e.stopPropagation()
  const card = (e.currentTarget as HTMLElement).closest('.dash-card') as HTMLElement
  if (!card) return
  const grid = card.parentElement!
  if (!grid) return

  const colUnit = grid.offsetWidth / 3
  const rowUnit = 120

  const startX = e.clientX
  const startY = e.clientY

  const custom = cardSpans.value[index]
  const startCol = custom ? custom.col : defaultSpan(plots.value[index], 'col')
  const startRow = custom ? custom.row : defaultSpan(plots.value[index], 'row')

  const tooltip = document.createElement('div')
  tooltip.className = 'resize-size-tooltip'
  card.appendChild(tooltip)

  function updateTooltip(col: number, row: number) {
    tooltip.textContent = `${col}x${row}`
  }
  updateTooltip(startCol, startRow)

  function onMouseMove(ev: MouseEvent) {
    const dx = ev.clientX - startX
    const dy = ev.clientY - startY

    const newCol = Math.max(1, Math.min(3, startCol + Math.round(dx / colUnit)))
    const newRow = Math.max(1, Math.min(4, startRow + Math.round(dy / rowUnit)))

    card.style.gridColumn = 'span ' + newCol
    card.style.gridRow = 'span ' + newRow
    updateTooltip(newCol, newRow)
  }

  function onMouseUp() {
    const finalCol = parseInt(card.style.gridColumn?.replace('span ', '') || String(startCol))
    const finalRow = parseInt(card.style.gridRow?.replace('span ', '') || String(startRow))

    const defCol = defaultSpan(plots.value[index], 'col')
    const defRow = defaultSpan(plots.value[index], 'row')

    if (finalCol === defCol && finalRow === defRow) {
      const next = { ...cardSpans.value }
      delete next[index]
      cardSpans.value = next
      card.style.gridColumn = ''
      card.style.gridRow = ''
    } else {
      cardSpans.value = { ...cardSpans.value, [index]: { col: finalCol, row: finalRow } }
    }

    if (tooltip.parentElement) tooltip.parentElement.removeChild(tooltip)

    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)

    nextTick(() => {
      setTimeout(() => resizeAllPlots(), 50)
    })
  }

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}


async function exportDashboardHTML() {
  const currentPlots = plots.value
  const title = projectTitle.value
  const currentInsights = insights.value
  const metrics = keyMetrics.value
  const fi = fileInfo.value

  const imagePromises = currentPlots.map((plot, i) => {
    if (plot.type === 'boxplot') return Promise.resolve({ title: plot.title, src: '' })
    const el = document.getElementById('plot-' + i)
    if (!el) return Promise.resolve({ title: plot.title, src: '' })
    return Plotly.toImage(el, { format: 'png', width: 800, height: 500 })
      .then((src: string) => ({ title: plot.title, src }))
      .catch(() => ({ title: plot.title, src: '' }))
  })

  const images = await Promise.all(imagePromises)
  const bgPrimary = getComputedStyle(document.documentElement).getPropertyValue('--bg-primary').trim()
  const bgCard = getComputedStyle(document.documentElement).getPropertyValue('--bg-card').trim()
  const textPrimary = getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim()
  const textMuted = getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim()
  const accentPrimary = getComputedStyle(document.documentElement).getPropertyValue('--accent-primary').trim()
  const borderColor = getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim()

  let html = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} — Hermenius Dashboard</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
    max-width: 1200px; margin: 0 auto; padding: 2rem;
    background: ${bgPrimary}; color: ${textPrimary}; line-height: 1.6;
  }
  h1 { margin-bottom: 0.5rem; font-size: 1.8rem; }
  .subtitle { color: ${textMuted}; font-size: 0.9rem; margin-bottom: 2rem; }
  .metrics { display: flex; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap; }
  .metric {
    background: ${bgCard}; padding: 1.25rem; border-radius: 20px;
    text-align: center; min-width: 140px; border: 1px solid ${borderColor};
  }
  .metric-value { font-size: 1.8rem; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: ${accentPrimary}; }
  .metric-label { font-size: 0.8rem; color: ${textMuted}; margin-top: 0.25rem; }
  .chart-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; margin-bottom: 2rem; }
  .chart-card {
    background: ${bgCard}; border-radius: 20px; padding: 1rem;
    border: 1px solid ${borderColor}; overflow: hidden;
  }
  .chart-card img { width: 100%; height: auto; border-radius: 12px; display: block; }
  .chart-title { font-size: 0.95rem; font-weight: 600; margin-bottom: 0.75rem; }
  .insights { margin-top: 1.5rem; }
  .insights h2 { font-size: 1.3rem; margin-bottom: 1rem; }
  .insight {
    background: ${bgCard}; padding: 1rem 1.25rem; border-radius: 12px;
    margin-bottom: 0.75rem; border-left: 4px solid ${accentPrimary};
    color: ${textPrimary}; font-size: 0.9rem; line-height: 1.5;
  }
  .insight:nth-child(2) { border-left-color: #10b981; }
  .insight:nth-child(3) { border-left-color: #f59e0b; }
  .footer { margin-top: 2rem; padding-top: 1rem; border-top: 1px solid ${borderColor}; color: ${textMuted}; font-size: 0.8rem; text-align: center; }
  @media (max-width: 768px) { .chart-grid { grid-template-columns: 1fr; } }
</style>
</head>
<body>
<h1>${title}</h1>
<div class="subtitle">Hermenius Dashboard ${fi ? '— ' + fi.rows + ' ' + translate('rows') + ', ' + fi.columns + ' ' + translate('columns') : ''}</div>`

  if (metrics.length > 0) {
    html += '<div class="metrics">'
    for (const m of metrics) {
      html += `<div class="metric"><div class="metric-value">${m.value}</div><div class="metric-label">${m.label}</div></div>`
    }
    html += '</div>'
  }

  html += '<div class="chart-grid">'
  for (const img of images) {
    html += `<div class="chart-card"><div class="chart-title">${img.title}</div>`
    if (img.src) html += `<img src="${img.src}" alt="${img.title}">`
    html += '</div>'
  }
  html += '</div>'

  if (currentInsights.length > 0) {
    html += '<div class="insights"><h2>' + translate('insights') + '</h2>'
    for (const insight of currentInsights) {
      html += `<div class="insight">${insight}</div>`
    }
    html += '</div>'
  }

  html += `<div class="footer">Generated by Hermenius — ${new Date().toLocaleString()}</div>`
  html += '</body></html>'

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `hermenius-${title.replace(/[^a-zA-Z0-9а-яА-Я_-]/g, '_')}.html`
  a.click()
  URL.revokeObjectURL(a.href)
}


function exportDashboardPDF() {
  window.print()
}


async function exportDashboardPNG() {
  const currentPlots = plots.value
  const title = projectTitle.value

  const imageDataList: { title: string; dataUrl: string }[] = []
  for (let i = 0; i < currentPlots.length; i++) {
    const plot = currentPlots[i]
    if (plot.type === 'boxplot') continue
    const el = document.getElementById('plot-' + i)
    if (!el) continue
    try {
      const dataUrl = await Plotly.toImage(el, { format: 'png', width: 800, height: 500 })
      imageDataList.push({ title: plot.title, dataUrl })
    } catch {  }
  }

  if (imageDataList.length === 0) return

  const loadedImages = await Promise.all(imageDataList.map(item => loadImage(item.dataUrl)))

  const imgW = 800
  const imgH = 500
  const cols = Math.min(2, imageDataList.length)
  const rows = Math.ceil(loadedImages.length / cols)
  const padding = 40
  const titleH = 80
  const chartTitleH = 25
  const gap = 30

  const totalW = cols * imgW + (cols + 1) * padding
  const totalH = titleH + rows * (chartTitleH + imgH + gap)

  const canvas = document.createElement('canvas')
  canvas.width = totalW
  canvas.height = totalH
  const ctx = canvas.getContext('2d')!

  const bgPrimary = getComputedStyle(document.documentElement).getPropertyValue('--bg-primary').trim()
  ctx.fillStyle = bgPrimary || '#0d1117'
  ctx.fillRect(0, 0, totalW, totalH)

  const textPrimary = getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim()
  ctx.fillStyle = textPrimary || '#e6edf3'
  ctx.font = 'bold 28px sans-serif'
  ctx.fillText(title || 'Hermenius Dashboard', padding, padding + 28)

  const textMuted = getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim()
  ctx.fillStyle = textMuted || '#6e7681'
  ctx.font = '13px sans-serif'
  ctx.fillText(new Date().toLocaleString(), padding, padding + 52)

  for (let i = 0; i < loadedImages.length; i++) {
    const col = i % cols
    const row = Math.floor(i / cols)
    const x = padding + col * (imgW + gap)
    const y = titleH + row * (chartTitleH + imgH + gap)

    ctx.fillStyle = textPrimary || '#e6edf3'
    ctx.font = 'bold 15px sans-serif'
    ctx.fillText(imageDataList[i].title || '', x, y + 16)

    ctx.drawImage(loadedImages[i], x, y + chartTitleH, imgW, imgH)
  }

  canvas.toBlob((blob) => {
    if (!blob) return
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `hermenius-dashboard-${Date.now()}.png`
    a.click()
    URL.revokeObjectURL(a.href)
  }, 'image/png')
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}
</script>

<template>
  <div class="project-root">
    <div class="page-container project-page">
      <header class="project-header">
        <router-link to="/profile" class="back-link">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span>{{ translate('back_projects') }}</span>
        </router-link>
        <div class="project-title-group">
          <h1 class="project-title">{{ projectTitle }}</h1>
        </div>
        <div class="header-actions">
          <button
            v-if="analysisStore.canRegenerate"
            class="icon-btn regenerate-btn"
            :class="{ 'is-loading': regenerating || analysisStore.loading }"
            :disabled="regenerating || analysisStore.loading"
            @click="handleRegenerate"
            :title="translate('regenerate')"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
            </svg>
            <span v-if="regenerating || analysisStore.loading" class="regenerate-spinner"></span>
          </button>
          <button class="icon-btn lang-btn" @click="toggleLang" :title="'Language / Язык'">
            <span class="lang-label">{{ locale === 'ru' ? 'РУ' : 'EN' }}</span>
          </button>
          <button class="icon-btn" @click="showThemePanel = true" :title="translate('themes')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
        </div>
      </header>

      <main class="project-main">
        <div class="grid-hint" v-if="hasData">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="5 9 2 12 5 15"></polyline><polyline points="12 15 19 9 22 12"></polyline></svg>
          <span>{{ translate('drag_hint') }}</span>
        </div>

        <div class="metrics-bar" v-if="keyMetrics.length > 0">
          <div v-for="(metric, i) in keyMetrics" :key="i" class="metric-card">
            <div class="metric-card-value" :style="{ color: metric.color }">{{ metric.value }}</div>
            <div class="metric-card-label">{{ metric.label }}</div>
          </div>
        </div>

        <div class="dashboard-grid" id="dashboardGrid">
          <template v-if="hasData">
            <div
              v-for="(plot, index) in plots"
              :key="index"
              class="dash-card"
              :class="{ focused: focusedPlotId === 'plot-' + index }"
              :data-plot-index="index"
              draggable="true"
              :style="{
                gridColumn: 'span ' + getCardSpan(plot, 'col', index),
                gridRow: 'span ' + getCardSpan(plot, 'row', index),
              }"
              @click="handleCardClick(index)"
            >
              <div class="dash-card-header">
                <div class="dash-card-drag-handle" title="Перетащите">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="6" y1="3" x2="6" y2="15"></line>
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                  </svg>
                </div>
                <div style="flex:1;min-width:0;">
                  <h3 class="dash-card-title">{{ plot.title || 'График' }}</h3>
                  <div v-if="plot.layout?.title" class="dash-card-reason"></div>
                </div>
                <div class="dash-card-actions">
                  <button
                    class="dash-btn download-btn"
                    @click.stop="handleDownloadChart(index, plot)"
                    title="Скачать PNG"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                  </button>
                </div>
              </div>
              <div class="dash-card-body" v-if="plot.type === 'boxplot'" v-html="renderBoxplotTable(plot)"></div>
              <div class="dash-card-body dash-card-plot" v-else :id="'plot-' + index"></div>
              <div class="dash-resize-handle" draggable="false" @mousedown="handleResizeStart($event, index)"></div>
            </div>
          </template>
          <div v-else class="empty-state" style="grid-column:1/-1;">
            <p>{{ translate('no_data_desc') }}</p>
          </div>
        </div>

        <div v-if="hasError" class="error-banner">
          <div class="error-banner-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <div class="error-banner-text">
            <p>{{ errorMessage || translate('ai_failed') }}</p>
            <p class="error-banner-hint">{{ translate('try_again') }}</p>
          </div>
          <button
            v-if="analysisStore.canRegenerate"
            class="error-banner-btn"
            @click="handleRegenerate"
            :disabled="regenerating || analysisStore.loading"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
            </svg>
            <span>{{ translate('regenerate') }}</span>
          </button>
        </div>

        <div class="insights-section" v-if="insights.length > 0">
          <h2 class="insights-title">{{ translate('insights') }}</h2>
          <div class="insights-list">
            <div v-for="(insight, i) in insights" :key="i" class="insight-item">
              <span class="insight-number">{{ i + 1 }}</span>
              <span>{{ insight }}</span>
            </div>
          </div>
        </div>

        <div class="file-info-bar" v-if="fileInfo">
          <span>{{ fileInfo.filename || '—' }}</span>
          <span class="file-info-sep">|</span>
          <span>{{ fileInfo.rows }} {{ translate('rows') }}</span>
          <span class="file-info-sep">|</span>
          <span>{{ analysisStore.result?.processingTime?.toFixed(1) || 0 }} {{ translate('sec') }}</span>
        </div>
      </main>

      <footer class="project-footer">
        <div class="footer-monolith">
          <div class="footer-planks-container">
            <div class="footer-plank footer-plank-left" style="position:relative;">
              <div class="footer-plank-inner" @click="handleExportToggle">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <span>{{ translate('export') }}</span>
              </div>
            </div>

            <div class="footer-plank footer-plank-right">
              <router-link to="/profile" class="footer-plank-inner" style="text-decoration:none;color:inherit;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
                <span>{{ translate('back_projects') }}</span>
              </router-link>
            </div>
          </div>

          <div class="half-wheel">
            <div class="half-wheel-inner">
              <div class="half-wheel-grid">
                <button class="wheel-btn" @click="handleRegenerate" :disabled="regenerating || analysisStore.loading" :title="translate('regenerate')">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                  </svg>
                </button>
                <button class="wheel-btn" @click="handleFullscreen" :title="translate('fullscreen')">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <polyline points="9 21 3 21 3 15"></polyline>
                    <line x1="21" y1="3" x2="14" y2="10"></line>
                    <line x1="3" y1="21" x2="10" y2="14"></line>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <ThemePanel :visible="showThemePanel" @update:visible="showThemePanel = $event" />
      <ExportMenu
        :visible="showExportMenu"
        :position="exportPosition"
        @update:visible="showExportMenu = $event"
        @export="handleExportAction"
      />
    </div>
  </div>
</template>
