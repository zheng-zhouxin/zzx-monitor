import type { Integration, Transport } from '../types'

const LEVELS = ['error', 'warn', 'log'] as const
type Level = (typeof LEVELS)[number]

/**
 * 劫持 console.error/warn/log，转发为上报事件
 * 同时保留原方法行为，业务侧日志照常打印
 */
export function captureConsoleIntegration(): Integration {
    // 闭包保存原方法，便于在需要时恢复
    const originals: Partial<Record<Level, (...a: unknown[]) => void>> = {}
    return {
        name: 'captureConsole',
        init(transport: Transport) {
            if (originals.error) return // 幂等保护，防二次包装
            for (const level of LEVELS) {
                const origin = console[level].bind(console)
                originals[level] = origin
                console[level] = (...args: unknown[]) => {
                    transport.send({ event_type: 'custom', type: 'console', level, args })
                    origin(...args) // 保留原行为
                }
            }
        },
    }
}
