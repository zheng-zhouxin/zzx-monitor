import type { Transport, TransportData } from './types'

// 模块级单例 Transport，供函数式 API 使用
let moduleTransport: Transport | null = null

/** 注入 Transport 到模块作用域（由 Monitoring.init 调用） */
export function setTransport(t: Transport | null) {
    moduleTransport = t
}

/** 获取模块级 Transport（供函数式 capture* API 使用） */
export function getTransport() {
    return moduleTransport
}

/** 捕获异常并上报 */
export function captureException(exception: Error) {
    moduleTransport?.send({ event_type: 'custom', type: 'customError', exception } satisfies TransportData)
}

/** 捕获文本消息并上报 */
export function captureMessage(message: string) {
    moduleTransport?.send({ event_type: 'custom', type: 'customMessage', message } satisfies TransportData)
}

/** 捕获自定义事件并上报 */
export function captureEvent<T>(eventData: T) {
    moduleTransport?.send({ event_type: 'custom', type: 'customEvent', eventData } satisfies TransportData)
}
