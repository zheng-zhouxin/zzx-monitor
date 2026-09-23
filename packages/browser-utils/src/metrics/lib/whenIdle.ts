import { onHidden } from './onHidden.js'
import { runOnce } from './runOnce.js'

/**
 * 在下一个空闲周期执行回调。
 * 若页面已 hidden 则立即执行（因为浏览器后台不会触发 idle callback）。
 * 用 requestIdleCallback（不支持则 setTimeout）。
 */
export const whenIdle = (cb: () => void): number => {
    const rIC = self.requestIdleCallback || self.setTimeout

    let handle = -1
    cb = runOnce(cb) // 保证只执行一次
    if (document.visibilityState === 'hidden') {
        cb()
    } else {
        handle = rIC(cb)
        onHidden(cb) // 页面隐藏时也兜底执行
    }
    return handle
}
