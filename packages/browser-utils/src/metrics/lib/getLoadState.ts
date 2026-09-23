import { getNavigationEntry } from './getNavigationEntry.js'
import { LoadState } from '../types.js'

/**
 * 给定一个时间戳，返回当时页面处于哪个加载阶段：
 * loading / dom-interactive / dom-content-loaded / complete
 * CLS 归因用它定位跳变发生在加载哪段。
 */
export const getLoadState = (timestamp: number): LoadState => {
    if (document.readyState === 'loading') {
        return 'loading'
    } else {
        const navigationEntry = getNavigationEntry()
        if (navigationEntry) {
            if (timestamp < navigationEntry.domInteractive) {
                return 'loading'
            } else if (navigationEntry.domContentLoadedEventStart === 0 || timestamp < navigationEntry.domContentLoadedEventStart) {
                return 'dom-interactive'
            } else if (navigationEntry.domComplete === 0 || timestamp < navigationEntry.domComplete) {
                return 'dom-content-loaded'
            }
        }
    }
    return 'complete'
}
