import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter<HttpException> {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp()
        const response = ctx.getResponse()
        const request = ctx.getRequest()
        const status = exception.getStatus()

        const exceptionRes: any = exception.getResponse()
        const { error, message } = exceptionRes

        // 统一错误返回结构：{ status, timestamp, path, error, message }
        response.status(status).json({
            status,
            timestamp: new Date().toISOString(),
            path: request.url,
            error,
            message,
        })
    }
}
