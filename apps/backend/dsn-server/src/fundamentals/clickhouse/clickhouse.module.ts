import { createClient } from '@clickhouse/client'
import { DynamicModule, Global, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'

@Global()
@Module({})
export class ClickhouseModule {
    // forRootAsync：从 ConfigService 读取 .env，避免连接信息硬编码
    static forRootAsync(): DynamicModule {
        return {
            module: ClickhouseModule,
            imports: [ConfigModule],
            providers: [
                {
                    provide: 'CLICKHOUSE_CLIENT', // 字符串 token，注入处用 @Inject('CLICKHOUSE_CLIENT')
                    useFactory: (config: ConfigService) => {
                        // 确保只初始化一次客户端（单例）
                        return createClient({
                            url: `http://${config.get('CLICKHOUSE_HOST')}:${config.get('CLICKHOUSE_PORT')}`,
                            username: config.get('CLICKHOUSE_USER'),
                            password: config.get('CLICKHOUSE_PASSWORD'),
                        })
                    },
                    inject: [ConfigService],
                },
            ],
            exports: ['CLICKHOUSE_CLIENT'], // 暴露给其他模块注入
        }
    }
}
