/**
 * 获取浏览器信息（UA / 平台 / 语言 / 来源页 / 路径）
 */
export function getBrowserInfo() {
    return {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        referrer: document.referrer,
        path: location.pathname,
    }
}

// 导出 Metrics Integration
export { Metrics } from './integrations/metrics'
