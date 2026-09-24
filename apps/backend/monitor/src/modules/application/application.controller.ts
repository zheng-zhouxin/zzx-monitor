import { Body, Controller, Delete, Get, Post, Put, Request, UseGuards, UsePipes } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { nanoid } from 'nanoid'

import { AdminEntity } from '../../entities/admin.entity'
import { ApplicationEntity } from '../../entities/application.entity'
import { ZodValidationPipe } from '../../pipes/zod-validation.pipe'
import { CreateApplicationDto, createApplicationSchema, DeleteApplicationDto, deleteApplicationSchema } from './application.dto'
import { ApplicationService } from './application.service'

/**
 * RESTful 风格控制器
 * 路由前缀 application，全部接口挂 AuthGuard('jwt')
 * POST   /application  -> create
 * PUT    /application  -> update
 * GET    /application  -> list
 * DELETE /application  -> delete
 */
@Controller('application')
@UseGuards(AuthGuard('jwt'))
export class ApplicationController {
    constructor(private readonly applicationService: ApplicationService) {}

    @Post()
    @UsePipes(new ZodValidationPipe(createApplicationSchema))
    async create(@Body() body: CreateApplicationDto, @Request() req) {
        const admin = new AdminEntity()
        admin.id = req.user.id
        const application = new ApplicationEntity(body)
        // appId 生成规则：类型前缀 + nanoid(6)，例如 react_xbQ12K
        Reflect.set<ApplicationEntity, 'appId'>(application, 'appId', application.type + nanoid(6))

        const newUser = await this.applicationService.create({ ...application, user: admin })
        return { data: newUser, success: true }
    }

    @Put()
    async update(@Body() body) {
        const newUser = await this.applicationService.update(body)
        return { data: newUser, success: true }
    }

    @Get()
    async list(@Request() req) {
        const list = await this.applicationService.list({ userId: req.user.id })
        return { data: list, success: true }
    }

    @Delete()
    @UsePipes(new ZodValidationPipe(deleteApplicationSchema))
    async delete(@Body() body: DeleteApplicationDto, @Request() req) {
        const newUser = await this.applicationService.delete({
            appId: body.appId,
            userId: req.user.id,
        })
        return { data: newUser, success: true }
    }
}
