/**
 * 若 document.prerendering 为 true，等 prerenderingchange 事件再执行；
 * 否则立即执行。保证指标只在页面真正激活后才开始采集。
 */
export const whenActivated = (callback: () => void) => {
    if (document.prerendering) {
        addEventListener('prerenderingchange', () => callback(), true)
    } else {
        callback()
    }
}
