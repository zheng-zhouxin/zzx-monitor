/**
 * 上报数据结构
 * event_type：事件大类（error / performance / custom），后端按此粗粒度分表
 * type：事件小类（如 jsError / LCP / customMessage），后端按此细粒度过滤
 * 其余字段由具体上报场景自由扩展
 */
export interface TransportData {
    event_type: 'error' | 'performance' | 'custom'
    type: string
    [key: string]: unknown
}

/**
 * Transport 抽象接口
 * 职责单一：把组装好的事件送到后端
 * 具体实现（fetchTransport / httpTransport）由平台包注入
 */
export interface Transport {
    send(data: TransportData): void | Promise<void>
}

/**
 * Integration 插件接口
 * SDK 初始化时被调用一次，拿到 transport 后挂载自己的采集逻辑
 */
export interface Integration {
    /** 插件名，便于调试与去重 */
    name: string
    /** SDK 初始化时被调用，拿到 transport 后注册自己的采集逻辑 */
    init(transport: Transport): void
}

/**
 * Monitoring 客户端配置
 */
export interface MonitoringOptions {
    /** 上报地址，由平台包的 Transport 实现使用 */
    dsn: string
    /** 要启用的插件列表，按需挂载；不传则不挂任何插件 */
    integrations?: Integration[]
}
