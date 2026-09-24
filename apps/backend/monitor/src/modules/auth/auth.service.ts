import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import { AdminService } from '../admin/admin.service'

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly adminService: AdminService
    ) {}

    /**
     * 由 LocalStrategy 调用，校验账号密码
     * 返回时去掉 password 字段，避免泄露
     */
    async validateUser(username: string, pass: string): Promise<any> {
        const admin = await this.adminService.validateUser(username, pass)
        if (admin) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password, ...result } = admin
            return result
        }
        return null
    }

    /** 登录成功后，用 JwtService 签发 access_token */
    async login(user: any): Promise<any> {
        const payload = { username: user.username, sub: user.userId }
        return {
            access_token: this.jwtService.sign(payload),
        }
    }

    /**
     * 登出
     * JWT 无状态，服务端没法主动失效，真正的「登出」是前端删 token
     * 严格踢人下线方案见下方知识卡片
     */
    async logout(): Promise<any> {
        return true
    }
}
