import { FirstInputPolyfillEntry, FirstInputPolyfillCallback } from '../../types.js'

type addOrRemoveEventListener = typeof addEventListener | typeof removeEventListener

let firstInputEvent: Event | null
let firstInputDelay: number
let firstInputTimeStamp: Date
let callbacks: FirstInputPolyfillCallback[]

const listenerOpts: AddEventListenerOptions = { passive: true, capture: true }
const startTimeStamp: Date = new Date()

/** 注册回调，首次输入确定后触发 */
export const firstInputPolyfill = (onFirstInput: FirstInputPolyfillCallback) => {
    callbacks.push(onFirstInput)
    reportFirstInputDelayIfRecordedAndValid()
}

/** 重置 polyfill 状态（bfcache 恢复时调用） */
export const resetFirstInputPolyfill = () => {
    callbacks = []
    firstInputDelay = -1
    firstInputEvent = null
    eachEventType(addEventListener)
}

/** 记录首次输入延迟 */
const recordFirstInputDelay = (delay: number, event: Event) => {
    if (!firstInputEvent) {
        firstInputEvent = event
        firstInputDelay = delay
        firstInputTimeStamp = new Date()

        eachEventType(removeEventListener)
        reportFirstInputDelayIfRecordedAndValid()
    }
}

/** 若已记录且有效，触发所有回调 */
const reportFirstInputDelayIfRecordedAndValid = () => {
    // 过滤异常值：负数或超过总时长的 delay
    if (
        firstInputDelay >= 0 &&
        // @ts-ignore
        firstInputDelay < firstInputTimeStamp - startTimeStamp
    ) {
        const entry = {
            entryType: 'first-input',
            name: firstInputEvent!.type,
            target: firstInputEvent!.target,
            cancelable: firstInputEvent!.cancelable,
            startTime: firstInputEvent!.timeStamp,
            processingStart: firstInputEvent!.timeStamp + firstInputDelay,
        } as FirstInputPolyfillEntry
        callbacks.forEach(function (callback) {
            callback(entry)
        })
        callbacks = []
    }
}

/**
 * pointerdown 特殊处理：要等 pointerup 或 pointercancel，
 * 因为 pointerdown 后可能是滚动/缩放，不算交互。
 */
const onPointerDown = (delay: number, event: Event) => {
    const onPointerUp = () => {
        recordFirstInputDelay(delay, event)
        removePointerEventListeners()
    }

    const onPointerCancel = () => {
        removePointerEventListeners()
    }

    const removePointerEventListeners = () => {
        removeEventListener('pointerup', onPointerUp, listenerOpts)
        removeEventListener('pointercancel', onPointerCancel, listenerOpts)
    }

    addEventListener('pointerup', onPointerUp, listenerOpts)
    addEventListener('pointercancel', onPointerCancel, listenerOpts)
}

/** 处理输入事件，计算 delay */
const onInput = (event: Event) => {
    // 只处理可取消的事件（用户有意义的交互）
    if (event.cancelable) {
        // event.timeStamp > 1e12 说明是 epoch 时间（老浏览器），否则是 performance 时间
        const isEpochTime = event.timeStamp > 1e12
        const now = isEpochTime ? new Date() : performance.now()

        // delay = 回调执行时间 - 事件到达时间
        const delay = (now as number) - event.timeStamp

        if (event.type == 'pointerdown') {
            onPointerDown(delay, event)
        } else {
            recordFirstInputDelay(delay, event)
        }
    }
}

/** 对所有事件类型添加/移除监听 */
const eachEventType = (callback: addOrRemoveEventListener) => {
    const eventTypes = ['mousedown', 'keydown', 'touchstart', 'pointerdown']
    eventTypes.forEach(type => callback(type, onInput, listenerOpts))
}
