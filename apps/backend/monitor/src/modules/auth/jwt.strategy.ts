import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

import { AdminService } from '../admin/admin.service'
import { jwtConstants } from './constants'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly adminService: AdminService) {
        super({
            jwtFromRequest: ExtractJwt.fromHeader('token'), // 从请求头 token 字段取
            ignoreExpiration: false, // 不忽略过期
            secretOrKey: jwtConstants.secret, // 验签密钥
        })
    }

    async validate(payload: any) {
        // payload 是解出来的 JWT payload，里面放的是签发时塞进去的字段
        const user = await this.adminService.validateUser(payload.username, payload.password)
        return user
    }
}
