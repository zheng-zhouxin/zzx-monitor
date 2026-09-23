import { getInteractionCount } from './polyfills/interactionCountPolyfill.js'

/** 单次交互 */
interface Interaction {
    id: number
    latency: number
    entries: PerformanceEventTiming[]
}

/** entry 预处理回调类型（归因 build 用） */
interface EntryPreProcessingHook {
    (entry: PerformanceEventTiming): void
}

// 最长交互列表（按 latency 降序），最多 10 个
export const longestInteractionList: Interaction[] = []

// interactionId → Interaction 的映射，快速查找
export const longestInteractionMap: Map<number, Interaction> = new Map()

// 默认 durationThreshold：低于 40ms 的 event 不进 observer
export const DEFAULT_DURATION_THRESHOLD = 40

// bfcache 恢复后的交互数基线，P98 只算当前导航
let prevInteractionCount = 0

/** 获取当前导航的交互数 */
const getInteractionCountForNavigation = () => {
    return getInteractionCount() - prevInteractionCount
}

/** 重置交互列表（bfcache 恢复时调用） */
export const resetInteractions = () => {
    prevInteractionCount = getInteractionCount()
    longestInteractionList.length = 0
    longestInteractionMap.clear()
}

/** 候选交互数上限 */
const MAX_INTERACTIONS_TO_CONSIDER = 10

/**
 * 估算 P98 最长交互。
 * 候选索引 = floor(总交互数 / 50)，但不超过列表长度 - 1。
 * 交互数 < 50 时取第 0 个（最慢的），交互越多索引越靠后。
 */
export const estimateP98LongestInteraction = () => {
    const candidateInteractionIndex = Math.min(longestInteractionList.length - 1, Math.floor(getInteractionCountForNavigation() / 50))
    return longestInteractionList[candidateInteractionIndex]
}

/** entry 预处理回调列表（归因 build 可挂载） */
export const entryPreProcessingCallbacks: EntryPreProcessingHook[] = []

/**
 * 处理 event entry：按 interactionId 聚合，更新交互列表。
 * 保持列表按 latency 降序、最多 10 个。
 */
export const processInteractionEntry = (entry: PerformanceEventTiming) => {
    entryPreProcessingCallbacks.forEach(cb => cb(entry))

    // 跳过没有 interactionId 且非 first-input 的 entry
    if (!(entry.interactionId || entry.entryType === 'first-input')) return

    // 列表中最短的那个交互
    const minLongestInteraction = longestInteractionList[longestInteractionList.length - 1]
    const existingInteraction = longestInteractionMap.get(entry.interactionId!)

    // 只处理可能进入 top-10 的 entry
    if (
        existingInteraction ||
        longestInteractionList.length < MAX_INTERACTIONS_TO_CONSIDER ||
        entry.duration > (minLongestInteraction?.latency ?? 0)
    ) {
        if (existingInteraction) {
            // 已存在的交互，更新 latency
            if (entry.duration > existingInteraction.latency) {
                existingInteraction.entries = [entry]
                existingInteraction.latency = entry.duration
            } else if (entry.duration === existingInteraction.latency && entry.startTime === existingInteraction.entries[0]?.startTime) {
                existingInteraction.entries.push(entry)
            }
        } else {
            // 新建交互
            const interaction = {
                id: entry.interactionId!,
                latency: entry.duration,
                entries: [entry],
            }
            longestInteractionMap.set(interaction.id, interaction)
            longestInteractionList.push(interaction)
        }

        // 按 latency 降序排序，只保留 top-10
        longestInteractionList.sort((a, b) => b.latency - a.latency)
        if (longestInteractionList.length > MAX_INTERACTIONS_TO_CONSIDER) {
            longestInteractionList.splice(MAX_INTERACTIONS_TO_CONSIDER).forEach(i => longestInteractionMap.delete(i.id))
        }
    }
}
