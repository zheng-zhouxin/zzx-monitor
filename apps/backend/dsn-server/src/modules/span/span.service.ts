import { ClickHouseClient } from '@clickhouse/client'
import { Inject, Injectable, Logger } from '@nestjs/common'

@Injectable()
export class SpanService {
    // 字符串 token 注入：与 ClickhouseModule 里 provide 的 'CLICKHOUSE_CLIENT' 对齐
    constructor(@Inject('CLICKHOUSE_CLIENT') private clickhouseClient: ClickHouseClient) {}

    // 写入：把 event_type / message 拎出来单列，其余塞 info
    async tracking(app_id: string, params: { event_type: string; message?: string }) {
        const { event_type, message, ...rest } = params
        const values = {
            app_id,
            event_type,
            message,
            info: rest, // JSONEachRow 模式下 client 会自动 JSON.stringify
        }

        const res = await this.clickhouseClient.insert({
            table: 'base_monitor_storage',
            values,
            columns: ['app_id', 'event_type', 'message', 'info'],
            format: 'JSONEachRow', // 必须显式指定格式，否则报 UNKNOWN_FORMAT
        })

        Logger.log('写入结果', JSON.stringify(res.summary))
    }

    // 查询：从物化视图取全部数据
    async span() {
        const res = await this.clickhouseClient.query({
            query: 'SELECT * FROM base_monitor_view',
        })
        const queryResult = await res.json()
        // CH 返回 { data, meta, rows } 结构，业务只关心 data
        return queryResult.data
    }

    // 查询所有错误事件
    async bugs() {
        const res = await this.clickhouseClient.query({
            query: `SELECT * FROM base_monitor_view WHERE event_type = 'error'`,
        })
        const queryResult = await res.json()
        return queryResult.data
    }

    // 查询性能事件并按 app_id / info.path 二级分组
    async performance() {
        const res = await this.clickhouseClient.query({
            query: `SELECT * FROM base_monitor_view WHERE event_type = 'performance'`,
        })
        const queryResult = await res.json()
        return groupData(queryResult.data)
    }
}

// 二级分组：返回 { [app_id]: { [path]: [span...] } }
function groupData(data: any[]) {
    return data.reduce((acc, curr) => {
        const { app_id, info } = curr
        const { path } = info

        // 初始化 app_id 组
        if (!acc[app_id]) {
            acc[app_id] = {}
        }

        // 初始化 path 组
        if (!acc[app_id][path]) {
            acc[app_id][path] = []
        }

        // 将当前数据添加到对应的分组
        acc[app_id][path].push(curr)

        return acc
    }, {})
}
