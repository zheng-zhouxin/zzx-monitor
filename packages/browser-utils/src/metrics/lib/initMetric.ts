import { getBFCacheRestoreTime } from './bfcache.js'
import { generateUniqueID } from './generateUniqueID.js'
import { getActivationStart } from './getActivationStart.js'
import { getNavigationEntry } from './getNavigationEntry.js'
import { MetricType } from '../types.js'

/**
 * 初始化一个指标对象。
 * 根据当前页面状态判断 navigationType：
 * - back-forward-cache：从 bfcache 恢复
 * - prerender：页面被预渲染过
 * - restore：页面被浏览器丢弃后恢复
 * - navigate / reload：正常导航
 */
export const initMetric = <MetricName extends MetricType['name']>(name: MetricName, value?: number) => {
    const navEntry = getNavigationEntry()
    let navigationType: MetricType['navigationType'] = 'navigate'

    if (getBFCacheRestoreTime() >= 0) {
        navigationType = 'back-forward-cache'
    } else if (navEntry) {
        if (document.prerendering || getActivationStart() > 0) {
            navigationType = 'prerender'
        } else if (document.wasDiscarded) {
            navigationType = 'restore'
        } else if (navEntry.type) {
            // 把 back_forward 转成 back-forward 保持一致
            navigationType = navEntry.type.replace(/_/g, '-') as MetricType['navigationType']
        }
    }

    const entries: Extract<MetricType, { name: MetricName }>['entries'] = []

    return {
        name,
        value: typeof value === 'undefined' ? -1 : value,
        rating: 'good' as const, // 上报时会被 bindReporter 更新
        delta: 0,
        entries,
        id: generateUniqueID(),
        navigationType,
    }
}
