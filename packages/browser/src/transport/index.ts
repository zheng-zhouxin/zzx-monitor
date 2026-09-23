import { getBrowserInfo } from '@zzx/monitor-sdk-browser-utils'
import { Transport } from '@zzx/monitor-sdk-core'

import type { BrowserInfo, ReportEvent } from '../types'

export class BrowserTransport implements Transport {
    // 标记页面是否正在卸载：pagehide 触发后置为 true，后续上报改走 sendBeacon
    private unloading = false

    constructor(private dsn: string) {
        // pagehide 兜底：页面卸载时把后续上报切换到 sendBeacon
        // sendBeacon 专为卸载场景设计，浏览器进程级别保证请求发出，不阻塞主线程
        window.addEventListener('pagehide', () => {
            this.unloading = true
        })
    }

    send(data: Record<string, unknown>) {
        // 1. 发送前补齐浏览器环境信息，后端按 UA/语言/来源页做维度分析
        const browserInfo = getBrowserInfo() as BrowserInfo
        const payload: ReportEvent = {
            ...data,
            browserInfo,
            timestamp: Date.now(),
        } as ReportEvent

        // 2. 卸载期间用 sendBeacon：不阻塞，浏览器保证送达
        if (this.unloading && navigator.sendBeacon) {
            const blob = new Blob([JSON.stringify(payload)], {
                type: 'application/json',
            })
            navigator.sendBeacon(this.dsn, blob)
            return
        }

        // 3. 正常路径用 fetch + keepalive：可读响应、可设 header
        //    keepalive 让请求在发起页面被卸载后仍能完成
        fetch(this.dsn, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            keepalive: true,
        }).catch(err => {
            console.error('[monitor] 上报失败', err)
        })
    }
}
