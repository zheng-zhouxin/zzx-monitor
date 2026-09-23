// entry type → 对应的 PerformanceEntry 子类型映射
interface PerformanceEntryMap {
    event: PerformanceEventTiming[]
    'first-input': PerformanceEventTiming[]
    'layout-shift': LayoutShift[]
    'largest-contentful-paint': LargestContentfulPaint[]
    'long-animation-frame': PerformanceLongAnimationFrameTiming[]
    paint: PerformancePaintTiming[]
    navigation: PerformanceNavigationTiming[]
    resource: PerformanceResourceTiming[]
}

/**
 * 封装 PerformanceObserver：自动开 buffered:true，做特性检测，
 * 用 Promise.resolve().then() 包回调绕过 Safari 同步执行的 bug，
 * 整体 try/catch 容错。不支持该 entry type 时返回 undefined。
 */
export const observe = <K extends keyof PerformanceEntryMap>(
    type: K,
    callback: (entries: PerformanceEntryMap[K]) => void,
    opts?: PerformanceObserverInit
): PerformanceObserver | undefined => {
    try {
        // 特性检测：浏览器不支持该 entry type 就静默返回
        if (PerformanceObserver.supportedEntryTypes.includes(type)) {
            const po = new PerformanceObserver(list => {
                // 用微任务延迟回调，绕过 Safari 立即同步执行的 bug
                // 详见 https://github.com/GoogleChrome/web-vitals/issues/277
                Promise.resolve().then(() => {
                    callback(list.getEntries() as PerformanceEntryMap[K])
                })
            })
            po.observe(
                Object.assign(
                    {
                        type,
                        buffered: true, // 关键：拿到 observer 创建前的历史 entry
                    },
                    opts || {}
                ) as PerformanceObserverInit
            )
            return po
        }
    } catch (e) {
        // 静默容错，不抛异常
    }
    return
}
