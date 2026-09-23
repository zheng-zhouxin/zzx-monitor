// import { Transport } from '@zzx/monitor-sdk-core'

import type { ClickPayload, Integration, NavigationPayload, RequestPayload, ResourceErrorPayload } from '../types'

interface Transport {
    send(data: Record<string, unknown>): void
}

/**
 * 生成元素选择器，形如 "body > div.card > button#submit"
 * 便于后端按选择器聚合点击热区
 */
function getSelector(target: Element | null): string {
    if (!target) return 'unknown'
    const parts: string[] = []
    let node: Element | null = target
    // 沿父链向上走，直到 html 或遇到带 id 的元素（id 唯一，足够定位）
    while (node && node.nodeType === 1) {
        let part = node.tagName.toLowerCase()
        if (node.id) {
            parts.unshift(part + '#' + node.id)
            break
        }
        if (node.classList && node.classList.length > 0) {
            part += '.' + Array.from(node.classList).join('.')
        }
        parts.unshift(part)
        node = node.parentElement
    }
    return parts.join(' > ')
}

/**
 * browserTracingIntegration：行为链路追踪
 * 用法：init({ dsn, integrations: [browserTracingIntegration()] })
 */
export function browserTracingIntegration(): Integration {
    return {
        name: 'browserTracingIntegration',
        init(transport: Transport) {
            // 1. 路由切换监听
            // popstate：浏览器后退/前进按钮触发
            window.addEventListener('popstate', () => {
                const payload: NavigationPayload = {
                    event_type: 'tracing',
                    type: 'navigation',
                    to: location.pathname,
                    path: location.pathname,
                }
                transport.send(payload)
            })

            // pushState/replaceState：SPA 内部切页不会触发 popstate，必须劫持
            const originalPushState = history.pushState.bind(history)
            history.pushState = function (data: unknown, unused: string, url?: string | URL | null) {
                originalPushState(data, unused, url)
                const payload: NavigationPayload = {
                    event_type: 'tracing',
                    type: 'navigation',
                    to: location.pathname,
                    path: location.pathname,
                }
                transport.send(payload)
            } as typeof history.pushState

            const originalReplaceState = history.replaceState.bind(history)
            history.replaceState = function (data: unknown, unused: string, url?: string | URL | null) {
                originalReplaceState(data, unused, url)
                const payload: NavigationPayload = {
                    event_type: 'tracing',
                    type: 'navigation',
                    to: location.pathname,
                    path: location.pathname,
                }
                transport.send(payload)
            } as typeof history.replaceState

            // 2. 点击事件委托：在 document 捕获阶段统一监听
            // 用捕获阶段（第三个参数 true）确保事件先于业务侧的冒泡监听器执行
            document.addEventListener(
                'click',
                e => {
                    const target = e.target as Element | null
                    const payload: ClickPayload = {
                        event_type: 'tracing',
                        type: 'click',
                        selector: getSelector(target),
                        path: window.location.pathname,
                    }
                    transport.send(payload)
                },
                true
            )

            // 3. 资源加载错误：<img>/<script>/<link> 加载失败不冒泡到 window.onerror
            //    需在 window 捕获阶段监听 error 事件
            window.addEventListener(
                'error',
                e => {
                    const target = e.target as EventTarget | null
                    // 资源错误：target 是元素（img/script/link 等），且不是 window 本身
                    // JS 运行时错误的 target 是 window，已由 Errors Integration 处理，这里跳过
                    if (target && target !== window && (target as Element).tagName) {
                        const el = target as HTMLElement
                        const src = (el as HTMLImageElement).src || (el as HTMLScriptElement).src || (el as HTMLLinkElement).href || ''
                        const payload: ResourceErrorPayload = {
                            event_type: 'tracing',
                            type: 'resourceError',
                            tagName: el.tagName.toLowerCase(),
                            src,
                            path: window.location.pathname,
                        }
                        transport.send(payload)
                    }
                },
                true
            )

            // 4. fetch 劫持：记录请求 URL、耗时、状态
            const originalFetch = window.fetch.bind(window)
            window.fetch = function (input: RequestInfo | URL, init?: RequestInit) {
                const start = performance.now()
                const url = typeof input === 'string' ? input : input instanceof Request ? input.url : String(input)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return originalFetch(input, init).then((res: { status: any }) => {
                    const payload: RequestPayload = {
                        event_type: 'tracing',
                        type: 'request',
                        url,
                        status: res.status,
                        duration: Math.round(performance.now() - start),
                        path: window.location.pathname,
                    }
                    transport.send(payload)
                    return res
                })
            } as typeof window.fetch
            // XMLHttpRequest 的劫持思路类似：包装 open() 记录 URL，包装 send() 计时并补 status，留作扩展
        },
    }
}
