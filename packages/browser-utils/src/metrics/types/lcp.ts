import type { Metric } from './base.js'

/** LCP 指标 */
export interface LCPMetric extends Metric {
    name: 'LCP'
    entries: LargestContentfulPaint[]
}

/** LCP 归因信息 */
export interface LCPAttribution {
    /** LCP 对应的元素（CSS 选择器） */
    element?: string
    /** LCP 图片资源 URL（文本节点则无） */
    url?: string
    /** TTFB 阶段耗时 */
    timeToFirstByte: number
    /** TTFB → 开始加载 LCP 资源的延迟 */
    resourceLoadDelay: number
    /** LCP 资源加载耗时 */
    resourceLoadDuration: number
    /** LCP 资源加载完成 → 元素渲染的延迟 */
    elementRenderDelay: number
    /** navigation entry，用于诊断 */
    navigationEntry?: PerformanceNavigationTiming
    /** LCP 资源的 resource entry */
    lcpResourceEntry?: PerformanceResourceTiming
    /** LCP 对应的 LargestContentfulPaint entry */
    lcpEntry?: LargestContentfulPaint
}

/** 带归因的 LCP 指标 */
export interface LCPMetricWithAttribution extends LCPMetric {
    attribution: LCPAttribution
}
