import { join } from 'node:path'

import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter'

export default () => ({
    email: {
        transport: process.env.SMTP_URL ?? 'smtps://user:pass@smtp.qq.com',
        defaults: {
            from: '"zzx-monitor" <noreply@example.com>',
        },
        template: {
            dir: join(__dirname, '../templates/email'),
            adapter: new PugAdapter(),
            options: { strict: true },
        },
    },
})
