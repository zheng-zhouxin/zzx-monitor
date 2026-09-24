import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const roles = this.reflector.get<string[]>('roles', context.getHandler())
        if (!roles) {
            return true // 没标 @Roles 就放行
        }
        const request = context.switchToHttp().getRequest()
        const { user } = request.query
        // 教学版：直接拿 query.user 比对；生产应改为读 req.user.roles
        return !!roles.find(role => role === user)
    }
}
