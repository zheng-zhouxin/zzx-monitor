import { z } from 'zod'

/** 创建应用 schema：type 必须是 vanilla/react/vue，name 必填 */
export const createApplicationSchema = z
    .object({
        type: z.enum(['vanilla', 'react', 'vue']),
        name: z.string(),
    })
    .required()

export type CreateApplicationDto = z.infer<typeof createApplicationSchema>

/** 删除应用 schema：只需 appId */
export const deleteApplicationSchema = z
    .object({
        appId: z.string(),
    })
    .required()

export type DeleteApplicationDto = z.infer<typeof deleteApplicationSchema>
