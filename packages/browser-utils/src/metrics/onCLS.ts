import { onBFCacheRestore } from './lib/bfcache.js'
import { initMetric } from './lib/initMetric.js'
import { observe } from './lib/observe.js'
import { bindReporter } from './lib/bindReporter.js'
import { doubleRAF } from './lib/doubleRAF.js'
import { onHidden } from './lib/onHidden.js'
import { runOnce } from './lib/runOnce.js'
import { onFCP } from './onFCP.js'
import { CLSMetric, MetricRatingThresholds, ReportOpts } from './types.js'

/** CLS 阈值：[0.1, 0.25] */
export const CLSThresholds: MetricRatingThresholds = [0.1, 0.25]

/**
 * 计算 CLS 值并回调。
 * CLS 按会话窗口分段累加，取所有会话里最大的 sessionValue。
 * 会话条件：相邻 shift 间隔 < 1s，总时长 < 5s。
 */
export const onCLS = (onReport: (metric: CLSMetric) => void, opts?: ReportOpts) => {
    opts = opts || {}

    // 先等 FCP 触发才开始监听 CLS（与 CrUX 行为一致）
    onFCP(
        runOnce(() => {
            let metric = initMetric('CLS', 0)
            let report: ReturnType<typeof bindReporter>

            let sessionValue = 0
            let sessionEntries: LayoutShift[] = []

            const handleEntries = (entries: LayoutShift[]) => {
                entries.forEach(entry => {
                    // 排除用户输入导致的跳变
                    if (!entry.hadRecentInput) {
                        const firstSessionEntry = sessionEntries[0]
                        const lastSessionEntry = sessionEntries[sessionEntries.length - 1]

                        // 会话窗口判断：间隔 < 1s 且总时长 < 5s
                        if (
                            sessionValue &&
                            entry.startTime - (lastSessionEntry?.startTime ?? 0) < 1000 &&
                            entry.startTime - (firstSessionEntry?.startTime ?? 0) < 5000
                        ) {
                            // 加入当前会话
                            sessionValue += entry.value
                            sessionEntries.push(entry)
                        } else {
                            // 开新会话
                            sessionValue = entry.value
                            sessionEntries = [entry]
                        }
                    }
                })

                // 取所有会话里最大的 sessionValue 作为 CLS
                if (sessionValue > metric.value) {
                    metric.value = sessionValue
                    metric.entries = sessionEntries
                    report()
                }
            }

            const po = observe('layout-shift', handleEntries)
            if (po) {
                report = bindReporter(onReport, metric, CLSThresholds, opts!.reportAllChanges)

                // 页面隐藏时取最终值
                onHidden(() => {
                    handleEntries(po.takeRecords() as CLSMetric['entries'])
                    report(true)
                })

                // bfcache 恢复后重置重新采集
                onBFCacheRestore(() => {
                    sessionValue = 0
                    metric = initMetric('CLS', 0)
                    report = bindReporter(onReport, metric, CLSThresholds, opts!.reportAllChanges)

                    doubleRAF(() => report())
                })

                // 排队一个 task，reportAllChanges 时能尽快上报
                setTimeout(report, 0)
            }
        })
    )
}
