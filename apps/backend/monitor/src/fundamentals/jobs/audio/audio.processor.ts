import { OnQueueActive, Process, Processor } from '@nestjs/bull'
import { Logger } from '@nestjs/common'
import { Job } from 'bull'

@Processor('audio') // 声明消费 audio 队列
export class AudioProcessor {
    private readonly logger = new Logger(AudioProcessor.name)

    /** 任务被激活时触发 */
    @OnQueueActive()
    onActive(job: Job) {
        this.logger.debug(`Processing job ${job.id} of type ${job.name} with data ${job.data}...`)
    }

    /** 处理名为 transcode 的任务 */
    @Process('transcode')
    handleTranscode(job: Job) {
        this.logger.debug('Start transcoding...')
        this.logger.debug(job.data)
        // 真实场景：调 ffmpeg 转码、写回 OSS
        this.logger.debug('Transcoding completed')
    }
}
