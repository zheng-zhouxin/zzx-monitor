import { observe } from '../observe.js'

// 扩展全局类型
declare global {
    interface Performance {
        interactionCount: number
    }
}

let interactionCountEstimate = 0
let minKnownInteractionId = Infinity
let maxKnownInteractionId = 0

/**
 * 根据已观察到的 interactionId 范围估算交互数。
 * 经验公式：(maxId - minId) / 7 + 1
 * Chrome 每次交互约分配 7 个连续 id。
 */
const updateEstimate = (entries: PerformanceEventTiming[]) => {
    entries.forEach(e => {
        if (e.interactionId) {
            minKnownInteractionId = Math.min(minKnownInteractionId, e.interactionId)
            maxKnownInteractionId = Math.max(maxKnownInteractionId, e.interactionId)
            interactionCountEstimate = maxKnownInteractionId ? (maxKnownInteractionId - minKnownInteractionId) / 7 + 1 : 0
        }
    })
}

let po: PerformanceObserver | undefined

/** 返回交互数：有 polyfill observer 用估算值，否则用原生 performance.interactionCount */
export const getInteractionCount = () => {
    return po ? interactionCountEstimate : performance.interactionCount || 0
}

/** 特性检测：原生支持就跳过，不支持则启动 polyfill */
export const initInteractionCountPolyfill = () => {
    if ('interactionCount' in performance || po) return

    po = observe('event', updateEstimate, {
        type: 'event',
        buffered: true,
        durationThreshold: 0, // 所有 event 都观察
    } as PerformanceObserverInit)
}
