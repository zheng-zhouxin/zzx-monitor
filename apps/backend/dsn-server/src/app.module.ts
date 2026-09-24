import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { ClickhouseModule } from './fundamentals/clickhouse/clickhouse.module'
import { SpanModule } from './modules/span/span.module'

@Module({
    imports: [
        // 加载 .env 到 process.env，全局可用，无需在每个子模块重复 imports
        ConfigModule.forRoot({ isGlobal: true }),
        // ClickHouse client provider，全局单例
        ClickhouseModule.forRootAsync(),
        // 业务模块：上报与查询
        SpanModule,
    ],
})
export class AppModule {}
