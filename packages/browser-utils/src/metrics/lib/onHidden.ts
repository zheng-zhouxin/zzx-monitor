/**
 * 页面 visibilityState 变为 hidden 时触发回调。
 * CLS / INP / LCP 都靠它做「最终上报」。
 */
export const onHidden = (cb: () => void) => {
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            cb()
        }
    })
}
