/**
 * 生成 30 字符的唯一 ID：v4-时间戳-13位随机数
 * 用于 metric 实例去重
 */
export const generateUniqueID = () => {
    return `v4-${Date.now()}-${Math.floor(Math.random() * (9e12 - 1)) + 1e12}`
}
