import { onBFCacheRestore } from './lib/bfcache.js'
import { bindReporter } from './lib/bindReporter.js'
import { getVisibilityWatcher } from './lib/getVisibilityWatcher.js'
import { initMetric } from './lib/initMetric.js'
import { observe } from './lib/observe.js'
import { onHidden } from './lib/onHidden.js'
import { firstInputPolyfill, resetFirstInputPolyfill } from './lib/polyfills/firstInputPolyfill.js'
import { runOnce } from './lib/runOnce.js'
import { whenActivated } from './lib/whenActivated.js'
import { FIDMetric, FirstInputPolyfillCallback, MetricRatingThresholds, ReportOpts } from './types.js'

/** FID 阈值：[100ms, 300ms] */
export const FIDThresholds: MetricRatingThresholds = [100, 300]

/**
 * 计算 FID 值并回调（已废弃，建议用 onINP）。
 * FID = 首次交互的 processingStart - startTime。
 */
export const onFID = (onReport: (metric: FIDMetric) => void, opts?: ReportOpts) => {
    opts = opts || {}

    whenActivated(() => {
        const visibilityWatcher = getVisibilityWatcher()
        let metric = initMetric('FID')
        let report: ReturnType<typeof bindReporter>

        const handleEntry = (entry: PerformanceEventTiming) => {
            // 只在页面首次隐藏前报告
            if (entry.startTime < visibilityWatcher.firstHiddenTime) {
                // processingStart 是主线程开始处理时间，startTime 是事件到达时间
                metric.value = entry.processingStart - entry.startTime
                metric.entries.push(entry)
                report(true)
            }
        }

        const handleEntries = (entries: FIDMetric['entries']) => {
            entries.forEach(handleEntry)
        }

        const po = observe('first-input', handleEntries)

        report = bindReporter(onReport, metric, FIDThresholds, opts!.reportAllChanges)

        if (po) {
            // 页面隐藏时取最终值
            onHidden(
                runOnce(() => {
                    handleEntries(po.takeRecords() as FIDMetric['entries'])
                    po.disconnect()
                })
            )

            // bfcache 恢复后重新采集（浏览器不会重发 first-input，用 polyfill 模拟）
            onBFCacheRestore(() => {
                metric = initMetric('FID')
                report = bindReporter(onReport, metric, FIDThresholds, opts!.reportAllChanges)

                resetFirstInputPolyfill()
                firstInputPolyfill(handleEntry as FirstInputPolyfillCallback)
            })
        }
    })
}
