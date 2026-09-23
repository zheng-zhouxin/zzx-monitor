import { MetricType, MetricRatingThresholds } from '../types.js'

/**
 * 根据 value 和阈值计算评级
 * value > thresholds[1] → poor
 * value > thresholds[0] → needs-improvement
 * 否则 → good
 */
const getRating = (value: number, thresholds: MetricRatingThresholds): MetricType['rating'] => {
    if (value > thresholds[1]) {
        return 'poor'
    }
    if (value > thresholds[0]) {
        return 'needs-improvement'
    }
    return 'good'
}

/**
 * 返回一个 report(forceReport?) 函数。
 * 内部维护 prevValue，只在值变化（delta≠0）或强制上报时触发回调。
 * 避免无效重复上报。
 */
export const bindReporter = <MetricName extends MetricType['name']>(
    callback: (metric: Extract<MetricType, { name: MetricName }>) => void,
    metric: Extract<MetricType, { name: MetricName }>,
    thresholds: MetricRatingThresholds,
    reportAllChanges?: boolean
) => {
    let prevValue: number
    let delta: number
    return (forceReport?: boolean) => {
        if (metric.value >= 0) {
            if (forceReport || reportAllChanges) {
                delta = metric.value - (prevValue || 0)

                // 有非零 delta 或首次上报时才触发回调
                if (delta || prevValue === undefined) {
                    prevValue = metric.value
                    metric.delta = delta
                    metric.rating = getRating(metric.value, thresholds)
                    callback(metric)
                }
            }
        }
    }
}
