import type { LoadState, Metric } from './base.js'

/** INP 指标 */
export interface INPMetric extends Metric {
    name: 'INP'
    entries: PerformanceEventTiming[]
}

/** INP 归因信息 */
export interface INPAttribution {
    /** 用户交互的元素（CSS 选择器） */
    interactionTarget: string
    /** 交互元素引用 */
    interactionTargetElement: Node | undefined
    /** 交互发生时间 */
    interactionTime: DOMHighResTimeStamp
    /** 下一帧渲染的最佳估算时间 */
    nextPaintTime: DOMHighResTimeStamp
    /** 交互类型：pointer / keyboard */
    interactionType: 'pointer' | 'keyboard'
    /** 同一动画帧内处理的 event entries */
    processedEventEntries: PerformanceEventTiming[]
    /** Long Animation Frame entries（若浏览器支持） */
    longAnimationFrameEntries: PerformanceLongAnimationFrameTiming[]
    /** 输入延迟 */
    inputDelay: number
    /** 事件处理总耗时 */
    processingDuration: number
    /** 处理完成 → 下一帧呈现的延迟 */
    presentationDelay: number
    /** 交互发生时的文档加载阶段 */
    loadState: LoadState
}

/** 带归因的 INP 指标 */
export interface INPMetricWithAttribution extends INPMetric {
    attribution: INPAttribution
}
