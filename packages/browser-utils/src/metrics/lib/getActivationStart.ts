import { getNavigationEntry } from './getNavigationEntry.js'

/**
 * 返回 navEntry.activationStart || 0
 * prerender 场景下所有指标都要减去这个值
 */
export const getActivationStart = (): number => {
    const navEntry = getNavigationEntry()
    return (navEntry && navEntry.activationStart) || 0
}
