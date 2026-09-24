import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

import { AppModule } from './app.module'
import { HttpExceptionFilter } from './fundamentals/common/filters/http-exception.filter'

async function bootstrap() {
    const app = await NestFactory.create(AppModule)

    // 全局异常过滤器：统一错误返回结构 { status, timestamp, path, error, message }
    app.useGlobalFilters(new HttpExceptionFilter())

    // 跨域放行：SDK 从任意业务页面 POST 上报
    // 这里示例放行 localhost 与 zzx 业务域名，可改成你自己的业务域名
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin || origin.includes('localhost') || origin.includes('zzx')) {
                callback(null, true)
            } else {
                callback(new Error('Not allowed by CORS'))
            }
        },
        credentials: true,
    })

    // 所有路由统一加 /api 前缀，最终路径形如 POST /api/tracing/:app_id
    app.setGlobalPrefix('api')

    // Swagger 文档配置
    const swaggerOptions = new DocumentBuilder()
        .setTitle('zzx-monitor 监控平台 SDK API 文档')
        .setDescription('zzx-monitor SDK 上报端点说明')
        .setVersion('1.0')
        .addBearerAuth()
        .build()
    const document = SwaggerModule.createDocument(app, swaggerOptions)
    SwaggerModule.setup('doc', app, document)

    // 默认 8080，可在 .env 用 PORT 覆盖
    const port = process.env.PORT || 8080
    await app.listen(port)
    // eslint-disable-next-line no-console
    console.log(`DSN server running on http://localhost:${port}, docs at http://localhost:${port}/doc`)
}
bootstrap()
