import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

import { AdminEntity } from './admin.entity'

@Entity('application')
export class ApplicationEntity {
    /**
     * 用于自实例化实体初始化
     * 例如 new ApplicationEntity({ name: 'xx', type: 'react' })
     */
    constructor(partial: Partial<ApplicationEntity>) {
        Object.assign(this, partial)
    }

    /** 主键 */
    @PrimaryGeneratedColumn()
    id: number

    /** 业务侧项目 ID，例如 "react_xbQ12K" */
    @Column({ type: 'varchar', length: 80 })
    appId: string

    /** 项目类型，对应 SDK 类型 */
    @Column({ type: 'enum', enum: ['vanilla', 'react', 'vue'] })
    type: 'vanilla' | 'react' | 'vue'

    /** 项目名称 */
    @Column({ type: 'varchar', length: 255 })
    name: string

    /** 项目描述 */
    @Column({ type: 'text', nullable: true })
    description: string

    /** 创建时间，由数据库 CURRENT_TIMESTAMP 默认填充 */
    @Column({ nullable: true, default: () => 'CURRENT_TIMESTAMP' })
    createdAt?: Date

    /** 更新时间 */
    @Column({ nullable: true })
    updatedAt?: Date

    /**
     * 项目所属用户（多对一）
     * 这里用字符串形式声明反向关系，避免循环 import；
     * TypeORM 会自动在 application 表生成 userId 列
     */
    @ManyToOne('AdminEntity', 'applications')
    user: AdminEntity
}
