/**
 * 安全地获取 PerformanceNavigationTiming。
 * 校验 responseStart > 0 且 < performance.now()，
 * 过滤掉隐私拦截 / 异常值。
 */
export const getNavigationEntry = (): PerformanceNavigationTiming | void => {
    const navigationEntry = self.performance && performance.getEntriesByType && performance.getEntriesByType('navigation')[0]

    // 校验 responseStart 有效（隐私模式下可能为 0 或负数）
    if (navigationEntry && navigationEntry.responseStart > 0 && navigationEntry.responseStart < performance.now()) {
        return navigationEntry
    }
}
