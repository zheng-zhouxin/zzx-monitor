import type { LoadState, Metric } from './base.js'

/** CLS 指标 */
export interface CLSMetric extends Metric {
    name: 'CLS'
    entries: LayoutShift[]
}

/** CLS 归因信息 */
export interface CLSAttribution {
    /** 最大跳变涉及的元素（CSS 选择器） */
    largestShiftTarget?: string
    /** 最大跳变发生时间 */
    largestShiftTime?: DOMHighResTimeStamp
    /** 最大跳变值 */
    largestShiftValue?: number
    /** 最大跳变的 LayoutShift entry */
    largestShiftEntry?: LayoutShift
    /** 最大跳变的元素来源 */
    largestShiftSource?: LayoutShiftAttribution
    /** 发生最大跳变时的文档加载阶段 */
    loadState?: LoadState
}

/** 带归因的 CLS 指标 */
export interface CLSMetricWithAttribution extends CLSMetric {
    attribution: CLSAttribution
}
