import type { Integration } from '../types'

/**
 * 兜底占位插件，演示 Integration 最简形态
 * 后续章节会替换为白屏检测、路由变化等
 */
export function captureOtherIntegration(): Integration {
    return {
        name: 'captureOther',
        init() {
            // 占位：后续章节在此挂载真实采集逻辑
        },
    }
}
