import { Transport } from '@zzx/monitor-sdk-core'

import type { ErrorPayload } from '../types'

/**
 * Errors Integration：捕获 JS 运行时错误与 Promise rejection
 * 构造时传入 transport，调用 init() 后挂载全局监听
 */
export class Errors {
    constructor(private transport: Transport) {}

    init() {
        // 1. 同步运行时错误：未捕获的 throw、语法错误、未定义变量等
        // window.onerror 的第五个参数 error 才是真正的 Error 对象（含 stack）
        window.onerror = (message, source, lineno, colno, error) => {
            const payload: ErrorPayload = {
                event_type: 'error',
                type: error?.name ?? 'Error',
                stack: error?.stack,
                // message 可能是字符串，也可能是事件对象，统一转成字符串
                message: typeof message === 'string' ? message : String(message),
                path: window.location.pathname,
            }
            this.transport.send(payload)
        }

        // 2. Promise 未处理的 rejection
        // 任何没有被 .catch 的 Promise reject 都会触发
        window.onunhandledrejection = event => {
            const reason = event.reason
            const payload: ErrorPayload = {
                event_type: 'error',
                type: 'unhandledrejection',
                // reason 可能是 Error 对象，也可能是普通值，都要兼容
                stack: reason?.stack,
                message: reason?.message ?? String(reason),
                path: window.location.pathname,
            }
            this.transport.send(payload)
        }
    }
}
