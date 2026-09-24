import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-local'

import { AuthService } from './auth.service'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly authService: AuthService) {
        super() // passport-local 默认从 body.username / body.password 取值
    }

    async validate(username: string, password: string): Promise<any> {
        const user = await this.authService.validateUser(username, password)
        if (!user) {
            throw new HttpException({ message: 'authorized failed', error: 'please try again later.' }, HttpStatus.BAD_REQUEST)
        }
        return user // 返回值会被 Passport 挂到 req.user
    }
}
