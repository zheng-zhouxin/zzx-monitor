import { onBFCacheRestore } from './lib/bfcache.js'
import { bindReporter } from './lib/bindReporter.js'
import { initMetric } from './lib/initMetric.js'
import {
    DEFAULT_DURATION_THRESHOLD,
    processInteractionEntry,
    estimateP98LongestInteraction,
    resetInteractions,
} from './lib/interactions.js'
import { observe } from './lib/observe.js'
import { onHidden } from './lib/onHidden.js'
import { initInteractionCountPolyfill } from './lib/polyfills/interactionCountPolyfill.js'
import { whenActivated } from './lib/whenActivated.js'
import { whenIdle } from './lib/whenIdle.js'

import { INPMetric, MetricRatingThresholds, ReportOpts } from './types.js'

/** INP 阈值：[200ms, 500ms] */
export const INPThresholds: MetricRatingThresholds = [200, 500]

/**
 * 计算 INP 值并回调。
 * INP = 所有交互里 P98 附近的那个延迟。
 * 维护最长 10 个交互的候选列表，页面隐藏时取最终值。
 */
export const onINP = (onReport: (metric: INPMetric) => void, opts?: ReportOpts) => {
    // 浏览器不支持 PerformanceEventTiming 或 interactionId 就直接返回
    if (!('PerformanceEventTiming' in self && 'interactionId' in PerformanceEventTiming.prototype)) {
        return
    }

    opts = opts || {}

    whenActivated(() => {
        // 初始化 interactionCount polyfill（老浏览器需要）
        initInteractionCountPolyfill()

        let metric = initMetric('INP')
        let report: ReturnType<typeof bindReporter>

        const handleEntries = (entries: INPMetric['entries']) => {
            // 用 whenIdle 延迟到空闲处理，确保同一交互的所有 event 都已分发
            whenIdle(() => {
                entries.forEach(processInteractionEntry)

                const inp = estimateP98LongestInteraction()

                if (inp && inp.latency !== metric.value) {
                    metric.value = inp.latency
                    metric.entries = inp.entries
                    report()
                }
            })
        }

        // 观察 event entry，durationThreshold 默认 40ms
        const po = observe('event', handleEntries, {
            durationThreshold: opts!.durationThreshold ?? DEFAULT_DURATION_THRESHOLD,
        })

        report = bindReporter(onReport, metric, INPThresholds, opts!.reportAllChanges)

        if (po) {
            // 额外观察 first-input，兼容短交互（< durationThreshold 的首次交互）
            po.observe({ type: 'first-input', buffered: true })

            // 页面隐藏时取最终值上报
            onHidden(() => {
                handleEntries(po.takeRecords() as INPMetric['entries'])
                report(true)
            })

            // bfcache 恢复后重置
            onBFCacheRestore(() => {
                resetInteractions()
                metric = initMetric('INP')
                report = bindReporter(onReport, metric, INPThresholds, opts!.reportAllChanges)
            })
        }
    })
}
