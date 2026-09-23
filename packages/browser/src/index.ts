import { Metrics } from '@zzx/monitor-sdk-browser-utils'
import { Monitoring } from '@zzx/monitor-sdk-core'

import { Errors } from './tracing/errorsIntegration'
import { BrowserTransport } from './transport'
import type { InitOptions } from './types'

export function init(options: InitOptions) {
    // 1. 创建 Monitoring 客户端（core 提供），只传 dsn，integrations 由 browser 自己管
    const monitoring = new Monitoring({
        dsn: options.dsn,
    })

    // 2. 创建浏览器 Transport
    const transport = new BrowserTransport(options.dsn)

    // 3. monitoring.init(transport) 内部会把 transport 写入 core 的全局 getTransport，
    //    让 captureMessage/captureException/captureEvent 能取到 transport 主动上报
    monitoring.init(transport)

    // 4. 装上默认 Integration：错误捕获 + 性能采集（无需用户配置）
    new Errors(transport).init()
    new Metrics(transport).init()

    // 5. 装上用户传入的 Integration（如 browserTracingIntegration）
    options.integrations?.forEach(integration => {
        integration.init(transport)
    })

    return monitoring
}

// 透传：业务侧按需引入链路追踪插件
export { browserTracingIntegration } from './tracing/browserTracingIntegration'
// 透传：业务侧主动上报自定义事件/异常/消息
export { captureEvent, captureException, captureMessage } from '@zzx/monitor-sdk-core'
// 透传类型：方便业务侧给 init 的 options 写类型
export type { InitOptions, Integration } from './types'
