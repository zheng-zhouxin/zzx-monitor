import type { Metric } from './base.js'

/** TTFB 指标 */
export interface TTFBMetric extends Metric {
    name: 'TTFB'
    entries: PerformanceNavigationTiming[]
}

/** TTFB 归因信息 */
export interface TTFBAttribution {
    /** 页面开始处理请求前的等待时间（含 HTTP 重定向） */
    waitingDuration: number
    /** HTTP 缓存检查耗时（含 service worker 启动） */
    cacheDuration: number
    /** DNS 解析耗时 */
    dnsDuration: number
    /** TCP + TLS 连接耗时 */
    connectionDuration: number
    /** 请求发出 → 首字节到达的耗时（网络 + 服务器处理） */
    requestDuration: number
    /** navigation entry */
    navigationEntry?: PerformanceNavigationTiming
}

/** 带归因的 TTFB 指标 */
export interface TTFBMetricWithAttribution extends TTFBMetric {
    attribution: TTFBAttribution
}
