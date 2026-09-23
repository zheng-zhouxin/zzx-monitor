import { bindReporter } from './lib/bindReporter.js'
import { initMetric } from './lib/initMetric.js'
import { onBFCacheRestore } from './lib/bfcache.js'
import { getNavigationEntry } from './lib/getNavigationEntry.js'
import { MetricRatingThresholds, ReportOpts, TTFBMetric } from './types.js'
import { getActivationStart } from './lib/getActivationStart.js'
import { whenActivated } from './lib/whenActivated.js'

/** TTFB 阈值：[800ms, 1800ms] */
export const TTFBThresholds: MetricRatingThresholds = [800, 1800]

/**
 * 在页面加载完成后（或 prerender 激活后）执行回调。
 * 必须等 load 事件结束，确保 navigation entry 所有字段都填好了。
 */
const whenReady = (callback: () => void) => {
    if (document.prerendering) {
        whenActivated(() => whenReady(callback))
    } else if (document.readyState !== 'complete') {
        addEventListener('load', () => whenReady(callback), true)
    } else {
        // 排一个 task，确保在 loadEventEnd 之后执行
        setTimeout(callback, 0)
    }
}

/**
 * 计算 TTFB 值并回调。
 * TTFB = navigation entry 的 responseStart - activationStart。
 */
export const onTTFB = (onReport: (metric: TTFBMetric) => void, opts?: ReportOpts) => {
    opts = opts || {}

    let metric = initMetric('TTFB')
    let report = bindReporter(onReport, metric, TTFBThresholds, opts.reportAllChanges)

    whenReady(() => {
        const navigationEntry = getNavigationEntry()

        if (navigationEntry) {
            // responseStart 即首字节时间，减 activationStart 兼容 prerender
            metric.value = Math.max(navigationEntry.responseStart - getActivationStart(), 0)
            metric.entries = [navigationEntry]
            report(true)

            // bfcache 恢复后重新上报
            onBFCacheRestore(() => {
                metric = initMetric('TTFB', 0)
                report = bindReporter(onReport, metric, TTFBThresholds, opts!.reportAllChanges)
                report(true)
            })
        }
    })
}
