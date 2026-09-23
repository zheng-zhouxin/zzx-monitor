/**
 * 获取节点名（元素用小写，其他节点去掉 # 前缀）
 */
const getName = (node: Node) => {
    const name = node.nodeName
    return node.nodeType === 1 ? name.toLowerCase() : name.toUpperCase().replace(/^#/, '')
}

/**
 * 从元素往上爬，生成 CSS 选择器。
 * 遇到 id 就停（id 全局唯一），结果形如 #header>div.container>img.hero。
 * 截断在 maxLen（默认 100）字符内，防止超长选择器撑爆存储。
 */
export const getSelector = (node: Node | null | undefined, maxLen?: number) => {
    let sel = ''

    try {
        while (node && node.nodeType !== 9) {
            // 9 = document 节点，到顶了
            const el: Element = node as Element
            const part = el.id
                ? '#' + el.id
                : getName(el) +
                  (el.classList && el.classList.value && el.classList.value.trim() && el.classList.value.trim().length
                      ? '.' + el.classList.value.trim().replace(/\s+/g, '.')
                      : '')
            if (sel.length + part.length > (maxLen || 100) - 1) return sel || part
            sel = sel ? part + '>' + sel : part
            if (el.id) break // 遇到 id 就停
            node = el.parentNode
        }
    } catch (err) {
        // 静默容错
    }
    return sel
}
