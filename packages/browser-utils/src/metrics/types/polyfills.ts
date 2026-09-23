/** polyfill 模拟的 first-input entry */
export type FirstInputPolyfillEntry = Omit<PerformanceEventTiming, 'processingEnd'>

/** first-input polyfill 回调 */
export interface FirstInputPolyfillCallback {
    (entry: FirstInputPolyfillEntry): void
}
