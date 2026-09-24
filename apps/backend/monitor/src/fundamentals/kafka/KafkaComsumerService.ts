import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { Client, ClientKafka, Transport } from '@nestjs/microservices'

@Injectable()
export class KafkaConsumerService implements OnModuleInit {
    constructor() {}

    async onModuleInit() {
        // 订阅 tracking 主题的响应流，并绑定 topics 元数据
        this.kafkaClient.subscribeToResponseOf('tracking')
        this.kafkaClient.bindTopics()
    }

    /**
     * 通过 @Client 装饰器声明 Kafka 客户端
     * clientId / groupId 统一使用 zzx 命名空间
     */
    @Client({
        transport: Transport.KAFKA,
        options: {
            client: {
                clientId: 'zzx-monitor',
                brokers: ['localhost:9092'],
            },
            consumer: {
                groupId: 'zzx-consumer',
            },
        },
    })
    private kafkaClient: ClientKafka

    /** 启动消费循环 */
    async consumeMessages() {
        await this.kafkaClient.connect()
        this.kafkaClient.send('tracking', {}).subscribe({
            next: async message => {
                const payload = message.value // 取 Kafka 消息内容
                // 这里可以调用将消息写入 ClickHouse 的逻辑
                await this.writeToClickHouse(payload)
            },
            error: err => {
                Logger.error('Error while consuming message', err)
            },
        })
    }

    /** 将消息写入 ClickHouse（备链路） */
    async writeToClickHouse(payload: any) {
        Logger.log('Writing to ClickHouse', JSON.stringify(payload))
        // 实际场景：调用 ClickHouseClient.insert(...)，与 DSN 直写形成双写备链路
    }
}
