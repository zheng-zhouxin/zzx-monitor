import type { Transport } from '@zzx/monitor-sdk-core'

// 上报事件类型：error 运行时错误 / performance 性能 / tracing 行为链路 / custom 业务自定义
export type EventType = 'error' | 'performance' | 'tracing' | 'custom'

// 上报事件基础结构：所有上报 payload 都至少带这几个字段
export interface ReportEvent {
    event_type: EventType
    type: string
    path?: string
    timestamp?: number
    browserInfo?: BrowserInfo
    [key: string]: unknown
}

// 浏览器环境信息（来自 browser-utils 的 getBrowserInfo）
export interface BrowserInfo {
    userAgent: string
    platform: string
    language: string
    referrer: string
    path: string
}

// 错误事件 payload
export interface ErrorPayload extends ReportEvent {
    event_type: 'error'
    stack?: string
    message: string
}

// 路由切换 tracing 事件
export interface NavigationPayload extends ReportEvent {
    event_type: 'tracing'
    type: 'navigation'
    to: string
}

// 点击 tracing 事件
export interface ClickPayload extends ReportEvent {
    event_type: 'tracing'
    type: 'click'
    selector: string
}

// 请求 tracing 事件
export interface RequestPayload extends ReportEvent {
    event_type: 'tracing'
    type: 'request'
    url: string
    status: number
    duration: number
}

// 资源错误 tracing 事件
export interface ResourceErrorPayload extends ReportEvent {
    event_type: 'tracing'
    type: 'resourceError'
    tagName: string
    src: string
}

// Integration 标准结构：与 core 的 Integration 形态对齐
// name 用于调试与去重，init(transport) 在 SDK 启动时被调用一次
export interface Integration {
    name: string
    init(transport: Transport): void
}

// init 入参
export interface InitOptions {
    dsn: string
    integrations?: Integration[]
}

export type { Transport }
