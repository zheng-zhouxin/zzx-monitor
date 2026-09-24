import axios, { CreateAxiosDefaults } from 'axios'

const config: CreateAxiosDefaults = {
    baseURL: '/api',
    timeout: 5000,
}

export const request = axios.create(config)

// 自动将本地存储的 token 添加到请求头
request.interceptors.request.use(config => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.token = token // 注意：自定义请求头 token，后端按 ctx.headers.token 取
    }
    return config
})

// 如果返回权限不足，跳转到登录页
request.interceptors.response.use(
    response => {
        // 响应拦截直接返回 response.data，调用方拿到的就是后端业务数据
        return response.data
    },
    error => {
        if (error.response.status === 401) {
            window.location.href = '/account/login'
        }
        return Promise.reject(error)
    }
)
