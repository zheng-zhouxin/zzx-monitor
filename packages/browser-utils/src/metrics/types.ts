// 聚合导出所有指标类型
export * from './types/base.js'
export * from './types/polyfills.js'

export * from './types/cls.js'
export * from './types/fcp.js'
export * from './types/fid.js'
export * from './types/inp.js'
export * from './types/lcp.js'
export * from './types/ttfb.js'

// ---------------------------------------------------------------------------
// 以下是对浏览器内置模块的类型扩展（declare global）
// ---------------------------------------------------------------------------

interface PerformanceEntryMap {
    navigation: PerformanceNavigationTiming
    resource: PerformanceResourceTiming
    paint: PerformancePaintTiming
}

declare global {
    // 扩展 Document：prerendering / wasDiscarded
    interface Document {
        prerendering?: boolean
        wasDiscarded?: boolean
    }

    // 扩展 Performance：类型安全的 getEntriesByType
    interface Performance {
        getEntriesByType<K extends keyof PerformanceEntryMap>(type: K): PerformanceEntryMap[K][]
        interactionCount: number
    }

    // 扩展 PerformanceObserverInit：支持 durationThreshold
    interface PerformanceObserverInit {
        durationThreshold?: number
    }

    // 扩展 PerformanceNavigationTiming：支持 activationStart
    interface PerformanceNavigationTiming {
        activationStart?: number
    }

    // PerformanceEventTiming：事件时序 entry
    interface PerformanceEventTiming extends PerformanceEntry {
        duration: DOMHighResTimeStamp
        interactionId: number
    }

    // LayoutShiftAttribution：布局偏移来源
    interface LayoutShiftAttribution {
        node?: Node
        previousRect: DOMRectReadOnly
        currentRect: DOMRectReadOnly
    }

    // LayoutShift：布局偏移 entry
    interface LayoutShift extends PerformanceEntry {
        value: number
        sources: LayoutShiftAttribution[]
        hadRecentInput: boolean
    }

    // LargestContentfulPaint：最大内容绘制 entry
    interface LargestContentfulPaint extends PerformanceEntry {
        readonly renderTime: DOMHighResTimeStamp
        readonly loadTime: DOMHighResTimeStamp
        readonly size: number
        readonly id: string
        readonly url: string
        readonly element: Element | null
    }

    // PerformanceLongAnimationFrameTiming：长动画帧 entry
    interface PerformanceLongAnimationFrameTiming extends PerformanceEntry {
        renderStart: DOMHighResTimeStamp
        duration: DOMHighResTimeStamp
    }
}
