import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

import { AppModule } from './app.module'
import { HttpExceptionFilter } from './fundamentals/common/filters/http-exception.filter'

async function bootstrap() {
    const app = await NestFactory.create(AppModule)

    // 全局中间件：app.use(logger) 也可以挂 express 中间件
    // app.use(logger)

    // 全局过滤器：统一异常返回格式
    app.useGlobalFilters(new HttpExceptionFilter())

    // 全局管道（按需开启）：
    // app.useGlobalPipes(new ValidationPipe())

    // 全局拦截器（按需开启）：
    // app.useGlobalInterceptors(new LoggingInterceptor())

    // 全局路由前缀：所有路由统一 /api/xxx，与 DSN 服务的 /dsn-api 区分
    app.setGlobalPrefix('api')

    // Swagger 文档：访问 /doc 即可看到 API 列表
    const swaggerOptions = new DocumentBuilder()
        .setTitle('zzx-monitor 主业务服务 API 文档')
        .setDescription('zzx-monitor 主业务服务 API 文档')
        .setVersion('1.0')
        .addBearerAuth()
        .build()
    const document = SwaggerModule.createDocument(app, swaggerOptions)
    SwaggerModule.setup('doc', app, document)

    // 监听 8081 端口
    await app.listen(8081)
}
bootstrap()
