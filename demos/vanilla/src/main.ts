// 必须放在入口最顶部，否则会漏掉首屏错误
import { browserTracingIntegration, init } from '@zzx/monitor-sdk-browser'
import { captureMessage } from '@zzx/monitor-sdk-core'

// 初始化 SDK：传入 DSN 与 tracing 插件
// DSN 里的 vanillaxcfUyL 是后端分配给本 demo 的 app_id
init({
    dsn: 'http://localhost:8080/api/tracing/vanillaxcfUyL',
    integrations: [browserTracingIntegration()],
})

// 主动上报一条消息（event_type: custom）
captureMessage('hello world')

// 模拟 Promise rejection（会被 onunhandledrejection 捕获，event_type: error）
Promise.reject(new Error('接口调用错误'))

// 模拟同步错误（会被 window.onerror 捕获，event_type: error）
setTimeout(() => {
    throw new Error('test error from demo')
}, 2000)

// 渲染一个按钮，用于演示 click tracing
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1>zzx-monitor vanilla demo</h1>
    <div class="card">
      <button id="counter" type="button">点我触发 click tracing</button>
    </div>
    <p>打开 DevTools → Network 面板，过滤 vanillaxcfUyL，查看上报请求</p>
  </div>
`

// 点击按钮：既会触发 click tracing，也会主动上报一条 message
document.querySelector<HTMLButtonElement>('#counter')!.addEventListener('click', () => {
    captureMessage('button clicked')
})
