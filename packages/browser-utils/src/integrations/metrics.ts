import { Transport } from '@zzx/monitor-sdk-core'

import { onCLS, onFCP, onLCP, onTTFB } from '../metrics'

/**
 * 计算页面加载时长（LOAD 指标）。
 * 从 navigation entry 取 loadEventEnd - startTime。
 */
export const onLoad = (callback: (metric: { name: string; value: number }) => void) => {
    const navigationEntries = performance.getEntriesByType('navigation')

    if (navigationEntries.length > 0) {
        const entry = navigationEntries[0] as PerformanceNavigationTiming

        let loadTime = entry ? entry.loadEventEnd - entry.startTime : 10

        // 确保 loadTime 有效
        if (loadTime <= 0) {
            loadTime = performance.now()
        }

        callback({ name: 'LOAD', value: loadTime })
    } else {
        // 无 navigation entry，用 performance.now() 兜底
        const loadTime = performance.now()
        callback({ name: 'LOAD', value: loadTime })
    }
}

/**
 * Metrics Integration——封装 Web Vitals 采集 + 上报。
 * 用法：client.addIntegration(new Metrics(transport))
 */
export class Metrics {
    constructor(private transport: Transport) {}

    init() {
        // 在 window load 后启动采集，确保所有资源加载完
        window.addEventListener('load', () => {
            ;[onCLS, onLCP, onFCP, onTTFB, onLoad].forEach(metricFn => {
                metricFn(metric => {
                    this.transport.send({
                        event_type: 'performance',
                        type: 'webVital',
                        name: metric.name,
                        value: metric.value,
                        path: window.location.pathname,
                    })
                })
            })
        })
    }
}
