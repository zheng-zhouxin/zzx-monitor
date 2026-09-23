// 基础 Metric 接口——所有指标的公共结构

// 指标各类型联合导入
import type { CLSMetric, CLSMetricWithAttribution } from './cls.js'
import type { FCPMetric, FCPMetricWithAttribution } from './fcp.js'
import type { FIDMetric, FIDMetricWithAttribution } from './fid.js'
import type { INPMetric, INPMetricWithAttribution } from './inp.js'
import type { LCPMetric, LCPMetricWithAttribution } from './lcp.js'
import type { TTFBMetric, TTFBMetricWithAttribution } from './ttfb.js'

// 所有指标的公共接口
export interface Metric {
    /** 指标名称（缩写） */
    name: 'CLS' | 'FCP' | 'FID' | 'INP' | 'LCP' | 'TTFB'
    /** 当前指标值 */
    value: number
    /** 评级：good / needs-improvement / poor */
    rating: 'good' | 'needs-improvement' | 'poor'
    /** 与上次上报值的差值。首次上报时 delta === value */
    delta: number
    /** 唯一 ID，标识本次 metric 实例，用于去重 */
    id: string
    /** 计算指标值用到的 PerformanceEntry 数组 */
    entries: PerformanceEntry[]
    /** 导航类型：navigate / reload / back-forward / back-forward-cache / prerender / restore */
    navigationType: 'navigate' | 'reload' | 'back-forward' | 'back-forward-cache' | 'prerender' | 'restore'
}

/** 所有支持的指标类型联合 */
export type MetricType = CLSMetric | FCPMetric | FIDMetric | INPMetric | LCPMetric | TTFBMetric

/** 所有带归因的指标类型联合 */
export type MetricWithAttribution =
    | CLSMetricWithAttribution
    | FCPMetricWithAttribution
    | FIDMetricWithAttribution
    | INPMetricWithAttribution
    | LCPMetricWithAttribution
    | TTFBMetricWithAttribution

/** 评级阈值二元数组：[good 上界, needs-improvement 上界] */
export type MetricRatingThresholds = [number, number]

/** 上报回调（已废弃，建议用具体指标的回调类型） */
export interface ReportCallback {
    (metric: MetricType): void
}

/** 指标采集选项 */
export interface ReportOpts {
    /** 是否每次值变化都上报（默认只在最终值确定时上报） */
    reportAllChanges?: boolean
    /** INP 专属：event duration 阈值，默认 40ms */
    durationThreshold?: number
}

/** 文档加载阶段 */
export type LoadState = 'loading' | 'dom-interactive' | 'dom-content-loaded' | 'complete'
