import type { LoadState, Metric } from './base.js'

/** FID 指标 */
export interface FIDMetric extends Metric {
    name: 'FID'
    entries: PerformanceEventTiming[]
}

/** FID 归因信息 */
export interface FIDAttribution {
    /** 用户交互的元素（CSS 选择器） */
    eventTarget: string
    /** 用户交互时间 */
    eventTime: number
    /** 事件类型 */
    eventType: string
    /** FID 对应的 PerformanceEventTiming entry */
    eventEntry: PerformanceEventTiming
    /** 首次交互时的文档加载阶段 */
    loadState: LoadState
}

/** 带归因的 FID 指标 */
export interface FIDMetricWithAttribution extends FIDMetric {
    attribution: FIDAttribution
}
