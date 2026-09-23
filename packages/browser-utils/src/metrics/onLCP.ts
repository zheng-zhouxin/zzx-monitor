import { onBFCacheRestore } from './lib/bfcache.js'
import { bindReporter } from './lib/bindReporter.js'
import { doubleRAF } from './lib/doubleRAF.js'
import { getActivationStart } from './lib/getActivationStart.js'
import { getVisibilityWatcher } from './lib/getVisibilityWatcher.js'
import { initMetric } from './lib/initMetric.js'
import { observe } from './lib/observe.js'
import { onHidden } from './lib/onHidden.js'
import { runOnce } from './lib/runOnce.js'
import { whenActivated } from './lib/whenActivated.js'
import { whenIdle } from './lib/whenIdle.js'
import { LCPMetric, MetricRatingThresholds, ReportOpts } from './types.js'

/** LCP 阈值：[2500ms, 4000ms] */
export const LCPThresholds: MetricRatingThresholds = [2500, 4000]

// 已上报的 metric ID，防止重复上报
const reportedMetricIDs: Record<string, boolean> = {}

/**
 * 计算 LCP 值并回调。
 * LCP 会随页面渲染不断更新（每来一个更大元素触发一次），
 * 在用户首次交互或页面隐藏时冻结最终值。
 */
export const onLCP = (onReport: (metric: LCPMetric) => void, opts?: ReportOpts) => {
    opts = opts || {}

    whenActivated(() => {
        const visibilityWatcher = getVisibilityWatcher()
        let metric = initMetric('LCP')
        let report: ReturnType<typeof bindReporter>

        const handleEntries = (entries: LCPMetric['entries']) => {
            // 默认只看最后一个 entry（最大者会不断刷新）
            if (!opts!.reportAllChanges) {
                entries = entries.slice(-1)
            }

            entries.forEach(entry => {
                // 只在页面首次隐藏前报告，背景页面的 LCP 不算数
                if (entry.startTime < visibilityWatcher.firstHiddenTime) {
                    // 减去 activationStart 兼容 prerender 场景
                    metric.value = Math.max(entry.startTime - getActivationStart(), 0)
                    metric.entries = [entry]
                    report()
                }
            })
        }

        const po = observe('largest-contentful-paint', handleEntries)

        if (po) {
            report = bindReporter(onReport, metric, LCPThresholds, opts!.reportAllChanges)

            // 停止监听逻辑——只执行一次
            const stopListening = runOnce(() => {
                if (!reportedMetricIDs[metric.id]) {
                    handleEntries(po!.takeRecords() as LCPMetric['entries'])
                    po!.disconnect()
                    reportedMetricIDs[metric.id] = true
                    report(true) // 强制上报最终值
                }
            })

            // 用户首次交互触发停止（用 whenIdle 延迟，避免拖慢交互本身影响 INP）
            ;['keydown', 'click'].forEach(type => {
                addEventListener(type, () => whenIdle(stopListening), true)
            })

            // 页面隐藏也触发停止
            onHidden(stopListening)

            // bfcache 恢复后重新采集
            onBFCacheRestore(event => {
                metric = initMetric('LCP')
                report = bindReporter(onReport, metric, LCPThresholds, opts!.reportAllChanges)

                doubleRAF(() => {
                    metric.value = performance.now() - event.timeStamp
                    reportedMetricIDs[metric.id] = true
                    report(true)
                })
            })
        }
    })
}
