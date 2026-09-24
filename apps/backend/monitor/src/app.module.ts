import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'

import databaseConfig from './config/database'
import { ClickhouseModule } from './fundamentals/clickhouse/clickhouse.module'
import { LoggerMiddleware } from './fundamentals/common/middleware/logger.middleware'
import { ApplicationModule } from './modules/application/application.module'
import { AuthModule } from './modules/auth/auth.module'
import { VersionModule } from './modules/version/version.module'

@Module({
    imports: [
        // 加载 config/*.ts 工厂，把 database/redis/email 等配置塞进 ConfigService
        ConfigModule.forRoot({ load: [databaseConfig] }),

        // 异步注册 TypeORM，等 ConfigService 就绪后再读 database 配置
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (config: ConfigService) => config.get('database'),
            inject: [ConfigService],
        }),

        // 业务模块
        AuthModule,
        VersionModule,

        // ClickHouse 全局模块（@Global 装饰，子模块可直接 inject CLICKHOUSE_CLIENT）
        ClickhouseModule.forRoot({
            url: 'http://localhost:8123',
            username: 'default',
            password: 'zzxclickhouse',
        }),

        ApplicationModule,
    ],
    providers: [],
})
export class AppModule {
    // 中间件只能在 configure 里挂路由，不能走 useGlobalXxx
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(LoggerMiddleware).exclude({ path: 'hello', method: RequestMethod.POST }).forRoutes('hello')
    }
}
