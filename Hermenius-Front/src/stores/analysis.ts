import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

// ── Backend response types (matches FastAPI schemas exactly) ──

interface BackendKeyMetric {
  label: string
  value: string
  color: string
}

interface BackendFileInfo {
  file_name: string
  total_rows: number
  total_columns: number
  columns: string[]
}

interface BackendPlotData {
  type: string
  title: string
  subtable_name?: string
  data: Record<string, unknown>
  reason?: string
}

interface BackendOutlierReport {
  total_outliers: number
  columns_affected: string[]
  method: string
}

interface BackendAnalysisResponse {
  status: string
  message: string
  key_metrics: BackendKeyMetric[]
  file_info: BackendFileInfo
  ai_insights: string[]
  plots: BackendPlotData[]
  outlier_report: BackendOutlierReport | null
  processing_time_sec: number
}

export interface FileInfo {
  filename: string
  rows: number
  columns: number
  columnList: string[]
}

export interface PlotData {
  title: string
  type: string
  traces: Record<string, unknown>[]
  layout: Record<string, unknown>
  rawData?: Record<string, unknown>
}

export interface AnalysisResult {
  fileInfo: FileInfo
  keyMetrics: { label: string; value: string; color: string }[]
  plots: PlotData[]
  insights: string[]
  processingTime: number
  outlierReport: { total: number; columns: string[]; method: string } | null
  message: string
  status: 'success' | 'error'
}

export const DATASET_IDS = ['iris', 'students', 'titanic'] as const
export type DatasetId = typeof DATASET_IDS[number]

function convertToPlotlyTraces(plot: BackendPlotData): PlotData {
  const d = plot.data
  const baseLayout: Record<string, unknown> = {
    title: { text: plot.title, font: { size: 14 } },
    margin: { l: 50, r: 20, t: 40, b: 50 },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { color: '#9ca3af' },
  }

  const type = plot.type

  if (type === 'bar' || type === 'histogram') {
    const labels = (d.labels as string[]) || []
    const datasets = (d.datasets as { label: string; data: number[] }[]) || []
    const traces = datasets.map((ds, i) => ({
      type: 'bar',
      x: labels,
      y: ds.data,
      name: ds.label,
      marker: { color: ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'][i % 5] },
    }))
    return { title: plot.title, type, traces, layout: baseLayout, rawData: d }
  }

  if (type === 'scatter') {
    const datasets = (d.datasets as { label: string; data: { x: number; y: number }[] }[]) || []
    const traces = datasets.map((ds, i) => ({
      type: 'scatter',
      mode: 'markers' as const,
      x: ds.data.map((p: { x: number; y: number }) => p.x),
      y: ds.data.map((p: { x: number; y: number }) => p.y),
      name: ds.label,
      marker: { color: ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b'][i % 4], size: 6 },
    }))
    return { title: plot.title, type, traces, layout: baseLayout, rawData: d }
  }

  if (type === 'line') {
    const labels = (d.labels as (string | number)[]) || []
    const datasets = (d.datasets as { label: string; data: number[] }[]) || []
    const traces = datasets.map((ds, i) => ({
      type: 'scatter',
      mode: 'lines+markers' as const,
      x: labels,
      y: ds.data,
      name: ds.label,
      line: { color: ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b'][i % 4] },
    }))
    return { title: plot.title, type, traces, layout: baseLayout, rawData: d }
  }

  if (type === 'pie') {
    const labels = (d.labels as string[]) || []
    const values = (d.values as number[]) || []
    const traces = [{
      type: 'pie',
      labels,
      values,
      textinfo: 'label+percent' as const,
      textfont: { size: 12 },
      hole: 0.35,
    }]
    return { title: plot.title, type, traces, layout: { ...baseLayout, showlegend: true }, rawData: d }
  }

  if (type === 'heatmap') {
    const labels = (d.labels as string[]) || []
    const matrix = (d.matrix as number[][]) || []
    const traces = [{
      type: 'heatmap',
      z: matrix,
      x: labels,
      y: labels,
      colorscale: 'RdBu' as const,
      reversescale: true,
    }]
    return { title: plot.title, type, traces, layout: baseLayout, rawData: d }
  }

  if (type === 'boxplot') {
    const datasets = (d.datasets as { min: number; q1: number; median: number; q3: number; max: number }[]) || []
    const traces = datasets.map((ds, i) => ({
      type: 'box' as const,
      y: [ds.min, ds.q1, ds.median, ds.q3, ds.max],
      name: `Group ${i + 1}`,
      marker: { color: ['#06b6d4', '#8b5cf6', '#10b981'][i % 3] },
    }))
    return { title: plot.title, type: 'boxplot', traces, layout: baseLayout, rawData: d }
  }

  if (type === 'violin') {
    const datasets = (d.datasets as number[][]) || []
    const traces = datasets.map((data, i) => ({
      type: 'violin' as const,
      y: data,
      name: `Group ${i + 1}`,
      box: { visible: true },
      meanline: { visible: true },
      line: { color: ['#06b6d4', '#8b5cf6', '#10b981'][i % 3] },
    }))
    return { title: plot.title, type, traces, layout: baseLayout, rawData: d }
  }

  return { title: plot.title, type, traces: [], layout: baseLayout, rawData: d }
}

const ANALYSIS_STORAGE_KEY = 'hermenius-analysis'

function loadAnalysisFromStorage(): AnalysisResult | null {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(ANALYSIS_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AnalysisResult
  } catch {
    return null
  }
}

function saveAnalysisToStorage(data: AnalysisResult | null): void {
  if (typeof localStorage === 'undefined') return
  try {
    if (data) {
      localStorage.setItem(ANALYSIS_STORAGE_KEY, JSON.stringify(data))
    } else {
      localStorage.removeItem(ANALYSIS_STORAGE_KEY)
    }
  } catch {
  }
}

export const useAnalysisStore = defineStore('analysis', () => {
  const result = ref<AnalysisResult | null>(loadAnalysisFromStorage())
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  const lastRequest = ref<{ csv: string; filename: string; modelName: string; lang: string } | null>(null)

  const canRegenerate = computed(() => !!lastRequest.value)

  watch(result, (newVal) => {
    saveAnalysisToStorage(newVal)
  }, { deep: true })

  async function analyzeDataset(
    datasetId: string,
    modelName: string,
    lang: string,
  ): Promise<void> {
    const url = `/datasets/${datasetId}.csv`
    let csv: string
    try {
      const resp = await fetch(url)
      if (!resp.ok) throw new Error(`Dataset "${datasetId}" not found`)
      csv = await resp.text()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load dataset'
      return
    }
    await doAnalyze(csv, `${datasetId}.csv`, modelName, lang)
  }

  async function analyzeFile(
    file: File,
    modelName: string,
    lang: string,
  ): Promise<void> {
    const csv = await file.text()
    await doAnalyze(csv, file.name, modelName, lang)
  }

  async function regenerate(): Promise<void> {
    if (!lastRequest.value) return
    const { csv, filename, modelName, lang } = lastRequest.value
    await doAnalyze(csv, filename, modelName, lang, true)
  }

  async function doAnalyze(
    csv: string,
    filename: string,
    modelName: string,
    lang: string,
    skipCache: boolean = false,
  ): Promise<void> {
    loading.value = true
    error.value = null

    lastRequest.value = { csv, filename, modelName, lang }

    try {
      const formData = new FormData()
      const blob = new Blob([csv], { type: 'text/csv' })
      formData.append('file', blob, filename)
      formData.append('model_name', modelName)
      formData.append('lang', lang)
      if (skipCache) {
        formData.append('skip_cache', 'true')
      }

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const body = await response.text().catch(() => '')
        throw new Error(body || `HTTP ${response.status}: ${response.statusText}`)
      }

      const raw = (await response.json()) as BackendAnalysisResponse

      const plots: PlotData[] = (raw.plots || []).map(convertToPlotlyTraces)

      result.value = {
        fileInfo: {
          filename: raw.file_info.file_name,
          rows: raw.file_info.total_rows,
          columns: raw.file_info.total_columns,
          columnList: raw.file_info.columns,
        },
        keyMetrics: raw.key_metrics.map(m => ({
          label: m.label,
          value: m.value,
          color: m.color,
        })),
        plots,
        insights: raw.ai_insights || [],
        processingTime: raw.processing_time_sec,
        outlierReport: raw.outlier_report
          ? { total: raw.outlier_report.total_outliers, columns: raw.outlier_report.columns_affected, method: raw.outlier_report.method }
          : null,
        message: raw.message,
        status: (raw.status === 'error' ? 'error' : 'success') as 'success' | 'error',
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown analysis error'
      error.value = message
      result.value = null
    } finally {
      loading.value = false
    }
  }

  function clearResult(): void {
    result.value = null
    error.value = null
    saveAnalysisToStorage(null)
  }

  return {
    result,
    loading,
    error,
    lastRequest,
    canRegenerate,
    analyzeDataset,
    analyzeFile,
    regenerate,
    clearResult,
  }
})
