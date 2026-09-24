import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { AudioController } from './audio.controller'
import { AudioProcessor } from './audio.processor'

@Module({
    imports: [
        // 异步注册名为 audio 的队列，Redis 配置从 ConfigService 取
        BullModule.registerQueueAsync({
            name: 'audio',
            useFactory: (config: ConfigService) => ({
                redis: config.get('redis'),
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [AudioController],
    providers: [AudioProcessor],
})
export class AudioModule {}
