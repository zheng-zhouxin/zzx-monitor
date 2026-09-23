import { onBFCacheRestore } from './bfcache.js'

// 页面首次隐藏的时间戳，-1 表示尚未初始化
let firstHiddenTime = -1

/**
 * 初始化隐藏时间：
 * - 页面加载时已 hidden（背景标签）→ 0，所有 LCP/FCP 都不算数
 * - prerendering 状态下 visibilityState 也是 hidden，但不算，返回 Infinity
 */
const initHiddenTime = () => {
    return document.visibilityState === 'hidden' && !document.prerendering ? 0 : Infinity
}

const onVisibilityUpdate = (event: Event) => {
    if (document.visibilityState === 'hidden' && firstHiddenTime > -1) {
        // visibilitychange 事件 → 用事件时间戳
        // prerenderingchange 事件 → 页面在后台激活，一直 hidden，记为 0
        firstHiddenTime = event.type === 'visibilitychange' ? event.timeStamp : 0
        removeChangeListeners()
    }
}

const addChangeListeners = () => {
    addEventListener('visibilitychange', onVisibilityUpdate, true)
    // prerender 页面激活后也需要检查
    addEventListener('prerenderingchange', onVisibilityUpdate, true)
}

const removeChangeListeners = () => {
    removeEventListener('visibilitychange', onVisibilityUpdate, true)
    removeEventListener('prerenderingchange', onVisibilityUpdate, true)
}

/**
 * 返回 { firstHiddenTime } 对象。
 * LCP / FCP / FID 用它判断指标是否发生在页面可见期间。
 * bfcache 恢复时会重置。
 */
export const getVisibilityWatcher = () => {
    if (firstHiddenTime < 0) {
        firstHiddenTime = initHiddenTime()
        addChangeListeners()

        // bfcache 恢复后重置
        onBFCacheRestore(() => {
            // 延迟一个 task 让 visibilityState 有机会更新
            setTimeout(() => {
                firstHiddenTime = initHiddenTime()
                addChangeListeners()
            }, 0)
        })
    }
    return {
        get firstHiddenTime() {
            return firstHiddenTime
        },
    }
}
