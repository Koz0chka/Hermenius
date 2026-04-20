import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface ThemeDefinition {
  id: string
  name: string
  icon: string
  colors: string[]
  colorscale: [[number, string], [number, string]]
}

export interface PlotlyThemeConfig {
  colors: string[]
  paper_bgcolor: string
  plot_bgcolor: string
  font_color: string
  grid_color: string
  colorscale_heatmap: [number, string][]
  zeroline_color: string
}

export const THEMES: ThemeDefinition[] = [
  {
    id: 'classic-light',
    name: 'themes.classic_light',
    icon: '☀️',
    colors: ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#06b6d4'],
    colorscale: [[0, '#eef2ff'], [1, '#3b82f6']],
  },
  {
    id: 'midnight',
    name: 'themes.midnight',
    icon: '🌙',
    colors: ['#0078e7', '#f85149', '#2ea043', '#d29922', '#58a6ff', '#a371f7'],
    colorscale: [[0, '#0d1117'], [1, '#0078e7']],
  },
  {
    id: 'ocean',
    name: 'themes.ocean',
    icon: '🌊',
    colors: ['#06b6d4', '#38bdf8', '#10b981', '#f43f5e', '#818cf8', '#fbbf24'],
    colorscale: [[0, '#0a192f'], [1, '#06b6d4']],
  },
  {
    id: 'forest',
    name: 'themes.forest',
    icon: '🌲',
    colors: ['#10b981', '#34d399', '#fbbf24', '#f87171', '#67e8f9', '#a78bfa'],
    colorscale: [[0, '#0b1a14'], [1, '#10b981']],
  },
  {
    id: 'sunset',
    name: 'themes.sunset',
    icon: '🌅',
    colors: ['#f59e0b', '#fb923c', '#ef4444', '#84cc16', '#fbbf24', '#e879f9'],
    colorscale: [[0, '#1a1210'], [1, '#f59e0b']],
  },
  {
    id: 'lavender',
    name: 'themes.lavender',
    icon: '💜',
    colors: ['#8b5cf6', '#a78bfa', '#34d399', '#fbbf24', '#f87171', '#67e8f9'],
    colorscale: [[0, '#13111c'], [1, '#8b5cf6']],
  },
  {
    id: 'rose',
    name: 'themes.rose',
    icon: '🌹',
    colors: ['#ec4899', '#f472b6', '#34d399', '#fbbf24', '#818cf8', '#fb923c'],
    colorscale: [[0, '#1a1017'], [1, '#ec4899']],
  },
  {
    id: 'arctic',
    name: 'themes.arctic',
    icon: '❄️',
    colors: ['#0ea5e9', '#38bdf8', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'],
    colorscale: [[0, '#e0f2fe'], [1, '#0ea5e9']],
  },
  {
    id: 'ember',
    name: 'themes.ember',
    icon: '🔥',
    colors: ['#ef4444', '#f87171', '#fb923c', '#fbbf24', '#4ade80', '#818cf8'],
    colorscale: [[0, '#1a0f0f'], [1, '#ef4444']],
  },
  {
    id: 'monochrome',
    name: 'themes.monochrome',
    icon: '⬜',
    colors: ['#6b7280', '#9ca3af', '#d1d5db', '#4ade80', '#fbbf24', '#93c5fd'],
    colorscale: [[0, '#111111'], [1, '#6b7280']],
  },
  {
    id: 'matrix',
    name: 'themes.matrix',
    icon: '🟢',
    colors: ['#22c55e', '#4ade80', '#86efac', '#fbbf24', '#f87171', '#38bdf8'],
    colorscale: [[0, '#0a0f0a'], [1, '#22c55e']],
  },
  {
    id: 'neon',
    name: 'themes.neon',
    icon: '💜',
    colors: ['#a855f7', '#c084fc', '#34d399', '#fbbf24', '#fb7185', '#38bdf8'],
    colorscale: [[0, '#0c0c14'], [1, '#a855f7']],
  },
  {
    id: 'cyberpunk',
    name: 'themes.cyberpunk',
    icon: '🌆',
    colors: ['#f43f5e', '#fb7185', '#22d3ee', '#38bdf8', '#fbbf24', '#a78bfa'],
    colorscale: [[0, '#0a0e17'], [1, '#f43f5e']],
  },
  {
    id: 'terminal',
    name: 'themes.terminal',
    icon: '💻',
    colors: ['#4ade80', '#86efac', '#fbbf24', '#f87171', '#67e8f9', '#d4d4d4'],
    colorscale: [[0, '#0d0d0d'], [1, '#4ade80']],
  },
  {
    id: 'amber',
    name: 'themes.amber',
    icon: '💛',
    colors: ['#fbbf24', '#f59e0b', '#84cc16', '#ef4444', '#38bdf8', '#a78bfa'],
    colorscale: [[0, '#141008'], [1, '#fbbf24']],
  },
]

const STORAGE_KEY = 'hermenius-theme'

function readCssVar(name: string): string {
  if (typeof document === 'undefined') return ''
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref<string>(
    typeof localStorage !== 'undefined'
      ? (localStorage.getItem(STORAGE_KEY) ?? 'classic-light')
      : 'classic-light',
  )

  const themeList = computed(() => THEMES)

  const activeTheme = computed<ThemeDefinition>(
    () => THEMES.find((t) => t.id === currentTheme.value) ?? THEMES[0],
  )

  function applyTheme(themeId: string): void {
    const root = document.documentElement
    root.classList.remove(...THEMES.map((t) => `theme-${t.id}`))

    if (themeId !== 'classic-light') {
      root.classList.add(`theme-${themeId}`)
    }

    currentTheme.value = themeId
    localStorage.setItem(STORAGE_KEY, themeId)
  }

  function getPlotlyConfig(): PlotlyThemeConfig {
    const theme = activeTheme.value

    return {
      colors: [...theme.colors],
      paper_bgcolor: readCssVar('--bg-card') || 'transparent',
      plot_bgcolor: readCssVar('--bg-secondary') || 'transparent',
      font_color: readCssVar('--text-primary') || '#333333',
      grid_color: readCssVar('--border-color') || 'rgba(0,0,0,0.1)',
      zeroline_color: readCssVar('--border-color') || 'rgba(0,0,0,0.1)',
      colorscale_heatmap: [
        [0, readCssVar('--bg-primary') || theme.colorscale[0][1]],
        [1, readCssVar('--accent-primary') || theme.colorscale[1][1]],
      ],
    }
  }

  function init(): void {
    applyTheme(currentTheme.value)
  }

  return {
    currentTheme,
    themeList,
    activeTheme,
    applyTheme,
    getPlotlyConfig,
    init,
  }
})
