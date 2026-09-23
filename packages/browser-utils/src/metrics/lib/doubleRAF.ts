/**
 * 套两层 requestAnimationFrame。
 * bfcache 恢复后用它等两帧渲染完再读 performance.now()，确保拿到稳定值。
 */
export const doubleRAF = (cb: () => unknown) => {
    requestAnimationFrame(() => requestAnimationFrame(() => cb()))
}
