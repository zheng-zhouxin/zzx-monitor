// 导出所有指标函数和阈值
export { onCLS, CLSThresholds } from './onCLS.js'
export { onFCP, FCPThresholds } from './onFCP.js'
export { onINP, INPThresholds } from './onINP.js'
export { onLCP, LCPThresholds } from './onLCP.js'
export { onTTFB, TTFBThresholds } from './onTTFB.js'

// 导出已废弃的指标（向后兼容）
export * from './deprecated.js'
// 导出所有类型
export * from './types.js'
