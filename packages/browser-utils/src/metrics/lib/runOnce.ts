/**
 * 包一层闭包，保证回调只执行一次。
 * LCP 停止逻辑用它防止 click + onHidden 重复触发。
 */
export const runOnce = (cb: () => void) => {
    let called = false
    return () => {
        if (!called) {
            cb()
            called = true
        }
    }
}
