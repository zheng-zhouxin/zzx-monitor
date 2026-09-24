import { join } from 'node:path'

export default () => ({
    database: {
        type: 'postgres' as const,
        host: process.env.PG_HOST ?? 'localhost',
        port: Number(process.env.PG_PORT ?? 5432),
        username: process.env.PG_USER ?? 'postgres',
        password: process.env.PG_PASSWORD ?? 'xiaoer',
        database: process.env.PG_DB ?? 'postgres',
        // 扫描所有 entity 文件，自动注册
        entities: [join(__dirname, '../', '**/**.entity{.ts,.js}')],
        // 生产必须关掉，改用 typeorm migration:run
        synchronize: process.env.NODE_ENV !== 'production',
    },
})
