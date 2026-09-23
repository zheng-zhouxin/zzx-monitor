import { onBFCacheRestore } from './lib/bfcache.js'
import { bindReporter } from './lib/bindReporter.js'
import { doubleRAF } from './lib/doubleRAF.js'
import { getActivationStart } from './lib/getActivationStart.js'
import { getVisibilityWatcher } from './lib/getVisibilityWatcher.js'
import { initMetric } from './lib/initMetric.js'
import { observe } from './lib/observe.js'
import { whenActivated } from './lib/whenActivated.js'
import { FCPMetric, MetricRatingThresholds, ReportOpts } from './types.js'

/** FCP 阈值：[1800ms, 3000ms] */
export const FCPThresholds: MetricRatingThresholds = [1800, 3000]

/**
 * 计算 FCP 值并回调。
 * 找到 name === 'first-contentful-paint' 的 paint entry 即可。
 */
export const onFCP = (onReport: (metric: FCPMetric) => void, opts?: ReportOpts) => {
    opts = opts || {}

    whenActivated(() => {
        const visibilityWatcher = getVisibilityWatcher()
        let metric = initMetric('FCP')
        let report: ReturnType<typeof bindReporter>

        const handleEntries = (entries: FCPMetric['entries']) => {
            entries.forEach(entry => {
                if (entry.name === 'first-contentful-paint') {
                    po!.disconnect() // FCP 只发生一次，拿到就停

                    // 只在页面首次隐藏前报告
                    if (entry.startTime < visibilityWatcher.firstHiddenTime) {
                        // 减去 activationStart 兼容 prerender
                        metric.value = Math.max(entry.startTime - getActivationStart(), 0)
                        metric.entries.push(entry)
                        report(true)
                    }
                }
            })
        }

        const po = observe('paint', handleEntries)

        if (po) {
            report = bindReporter(onReport, metric, FCPThresholds, opts!.reportAllChanges)

            // bfcache 恢复后重新采集
            onBFCacheRestore(event => {
                metric = initMetric('FCP')
                report = bindReporter(onReport, metric, FCPThresholds, opts!.reportAllChanges)

                doubleRAF(() => {
                    metric.value = performance.now() - event.timeStamp
                    report(true)
                })
            })
        }
    })
}
