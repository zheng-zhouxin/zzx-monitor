import { setTransport } from './captures'
import type { Integration, MonitoringOptions, Transport } from './types'

export class Monitoring {
    private transport: Transport | null = null

    constructor(private options: MonitoringOptions) {}

    /** 注入 Transport 并启动所有 Integration */
    init(transport: Transport): void {
        this.transport = transport
        setTransport(transport) // 同步到模块级单例，让函数式 API 也能上报
        this.options.integrations?.forEach((it: Integration) => it.init(transport))
    }

    /** 上报文本消息 */
    reportMessage(message: string) {
        this.transport?.send({ event_type: 'custom', type: 'customMessage', message })
    }

    /** 上报自定义事件 */
    reportEvent<T>(eventData: T) {
        this.transport?.send({ event_type: 'custom', type: 'customEvent', eventData })
    }
}
