/** bfcache 恢复回调类型 */
interface onBFCacheRestoreCallback {
    (event: PageTransitionEvent): void
}

// 记录 bfcache 恢复时间，-1 表示未发生
let bfcacheRestoreTime = -1

/** 获取 bfcache 恢复时间 */
export const getBFCacheRestoreTime = () => bfcacheRestoreTime

/**
 * 监听 pageshow 事件，若 persisted 为 true 表示从 bfcache 恢复。
 * bfcache 恢复不会重发 navigation entry，所有指标需要重置重新采集。
 */
export const onBFCacheRestore = (cb: onBFCacheRestoreCallback) => {
    addEventListener(
        'pageshow',
        event => {
            if (event.persisted) {
                bfcacheRestoreTime = event.timeStamp
                cb(event)
            }
        },
        true
    )
}
