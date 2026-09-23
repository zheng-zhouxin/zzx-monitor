// 客户端类
export { Monitoring } from './monitoring'

// 函数式捕获 API + 模块级 Transport 管理
export { captureException, captureMessage, captureEvent, getTransport, setTransport } from './captures'

// 内置插件
export { captureConsoleIntegration } from './integrations/captureConsole'
export { captureOtherIntegration } from './integrations/captureOther'

// 类型导出（import type 时用到）
export type { Transport, TransportData, Integration, MonitoringOptions } from './types'
