import type { LoadState, Metric } from './base.js'

/** FCP 指标 */
export interface FCPMetric extends Metric {
    name: 'FCP'
    entries: PerformancePaintTiming[]
}

/** FCP 归因信息 */
export interface FCPAttribution {
    /** TTFB 阶段耗时 */
    timeToFirstByte: number
    /** TTFB → FCP 的差值 */
    firstByteToFCP: number
    /** FCP 发生时的文档加载阶段 */
    loadState: LoadState
    /** FCP 对应的 paint entry */
    fcpEntry?: PerformancePaintTiming
    /** navigation entry */
    navigationEntry?: PerformanceNavigationTiming
}

/** 带归因的 FCP 指标 */
export interface FCPMetricWithAttribution extends FCPMetric {
    attribution: FCPAttribution
}
