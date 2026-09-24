import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

import { AuthService } from './auth.service'

@Controller()
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    /** 登录：走 LocalStrategy 校验账号密码 */
    @UseGuards(AuthGuard('local'))
    @Post('/auth/login')
    async login(@Request() req) {
        return { data: await this.authService.login(req.user), success: true }
    }

    /** 登出：要求带 token */
    @UseGuards(AuthGuard('jwt'))
    @Post('/auth/logout')
    async logout() {
        return { success: await this.authService.logout() }
    }

    /** 获取当前用户信息（鉴权示例） */
    @UseGuards(AuthGuard('jwt'))
    @Get('currentUser')
    currentUser(@Request() req) {
        return { data: req.user }
    }

    /** 同上，简化版 */
    @UseGuards(AuthGuard('jwt'))
    @Get('me')
    getProfile(@Request() req) {
        return req.user
    }
}
