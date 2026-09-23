// 页面加载时若已 hidden 则记 0，否则记 Infinity
let firstHiddenTime = document.visibilityState === 'hidden' ? 0 : Infinity

const onVisibilityChange = (event: Event) => {
    if (document.visibilityState === 'hidden') {
        firstHiddenTime = event.timeStamp
        removeEventListener('visibilitychange', onVisibilityChange, true)
    }
}

// 不要在 polyfill 之外无条件添加监听
addEventListener('visibilitychange', onVisibilityChange, true)

/** 获取页面首次隐藏时间 */
export const getFirstHiddenTime = () => firstHiddenTime
