import { Body, Controller, Get, Logger, Param, Post } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'

import { SpanService } from './span.service'

@ApiTags('SDK 上报')
@Controller()
export class SpanController {
    constructor(private readonly spanService: SpanService) {}

    @ApiOperation({ summary: '接收 SDK 上报的事件（写入 ClickHouse）' })
    @Post('tracing/:app_id')
    tracking(@Param() { app_id }: { app_id: string }, @Body() params: { event_type: string; message?: string }) {
        Logger.log(`收到上报 app_id=${app_id} event=${params.event_type}`)
        return this.spanService.tracking(app_id, params)
    }

    @ApiOperation({ summary: '查询全部上报事件（性能+错误+自定义）' })
    @Get('span')
    span() {
        return this.spanService.span()
    }

    @ApiOperation({ summary: '查询所有错误事件' })
    @Get('bugs')
    bugs() {
        return this.spanService.bugs()
    }

    @ApiOperation({ summary: '查询性能事件并按 app_id / path 二级分组' })
    @Get('performance')
    performance() {
        return this.spanService.performance()
    }
}
