import { HttpException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { AdminEntity } from '../../entities/admin.entity'

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(AdminEntity)
        private readonly adminRepository: Repository<AdminEntity>
    ) {}

    /** 账号密码校验：教学版直接明文比对，生产必须换 bcrypt（见下方知识卡片） */
    async validateUser(username: string, pass: string): Promise<any> {
        const admin = await this.adminRepository.findOne({
            where: { username, password: pass },
        })
        return admin
    }

    /** 注册管理员 */
    async register(body) {
        const adminIsExist = await this.adminRepository.findOne({
            where: { username: body.username },
        })
        if (adminIsExist) {
            throw new HttpException({ message: '用户已存在', error: 'user is existed' }, 400)
        }
        const admin = await this.adminRepository.create(body)
        await this.adminRepository.save(admin)
        return admin
    }
}
