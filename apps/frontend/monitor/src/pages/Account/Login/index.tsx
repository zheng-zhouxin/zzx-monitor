import { Lock, User } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import * as srv from '@/services'
import { CreateUserPayload } from '@/types/api'
import { encrypt } from '@/utils/crypto'

export function Login() {
    const form = useForm<CreateUserPayload>({
        defaultValues: {
            username: '',
            password: '',
        },
    })
    const [inputType, setInputType] = useState<'login' | 'register'>('login')
    const navigate = useNavigate()
    const { toast } = useToast()

    const handleSubmit = async (values: CreateUserPayload) => {
        const { password } = values
        // 前端做一次 bcrypt，避免明文密码出现在请求体里
        const encryptedPassword = await encrypt(password)
        if (!encryptedPassword) return

        try {
            // inputType 决定走登录还是注册接口（srv.login 或 srv.register）
            const res = await srv[inputType]({ ...values, password: encryptedPassword })

            if (!res.data) {
                toast({ variant: 'destructive', title: '请稍后重试' })
                return
            }

            if (inputType === 'login') {
                toast({ variant: 'success', title: '登录成功' })
                localStorage.setItem('token', res.data.access_token)
                const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || '/projects'
                navigate(redirectUrl)
            }

            if (inputType === 'register') {
                toast({ title: '注册成功，请前往登录' })
                setInputType('login')
            }
        } catch (err) {
            // @ts-expect-error err 是 unknown
            const msg = err?.response?.data?.message
            if (inputType === 'register') {
                toast({ variant: 'destructive', title: `注册失败，${msg}` })
                return
            }
            toast({ variant: 'destructive', title: '登录失败，用户名或密码错误，请重试' })
        }
    }

    const switchType = (type: 'login' | 'register') => {
        form.clearErrors()
        setInputType(type)
    }

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-100">
            {/* 背景装饰 */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl" />
                <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-indigo-200/40 blur-3xl" />
                <div
                    className="absolute inset-0 opacity-[0.35]"
                    style={{
                        backgroundImage:
                            'linear-gradient(to right, rgb(148 163 184 / 0.12) 1px, transparent 1px), linear-gradient(to bottom, rgb(148 163 184 / 0.12) 1px, transparent 1px)',
                        backgroundSize: '40px 40px',
                    }}
                />
            </div>

            <div className="relative z-10 w-[420px] max-w-[calc(100vw-2rem)]">
                {/* 品牌标题 */}
                <div className="mb-8 flex flex-col items-center">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-600/30">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-6 w-6 text-white"
                        >
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">性能与异常监控平台</h1>
                    <p className="mt-1.5 text-sm text-slate-500">前端性能与异常监控</p>
                </div>

                {/* 登录卡片 */}
                <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60">
                    {/* 登录 / 注册 切换 */}
                    <div className="mb-6 grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
                        <button
                            type="button"
                            onClick={() => switchType('login')}
                            className={`rounded-md py-2 text-sm font-medium transition-colors ${
                                inputType === 'login' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            账号登录
                        </button>
                        <button
                            type="button"
                            onClick={() => switchType('register')}
                            className={`rounded-md py-2 text-sm font-medium transition-colors ${
                                inputType === 'register' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            注册账号
                        </button>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                rules={{ required: '请输入用户名' }}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>用户名</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                                <Input {...field} placeholder="请输入用户名" className="h-10 pl-9" />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                rules={{ required: '请输入密码' }}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>密码</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                                <Input {...field} type="password" placeholder="请输入密码" className="h-10 pl-9" />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="h-10 w-full bg-blue-600 hover:bg-blue-700">
                                {inputType === 'login' ? '登 录' : '注 册'}
                            </Button>
                        </form>
                    </Form>

                    {inputType === 'login' ? (
                        <div className="mt-5 text-center text-sm text-slate-500">
                            没有账号?{' '}
                            <button
                                type="button"
                                className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
                                onClick={() => switchType('register')}
                            >
                                立即注册
                            </button>
                        </div>
                    ) : (
                        <div className="mt-5 text-center text-sm text-slate-500">
                            已有账号?{' '}
                            <button
                                type="button"
                                className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
                                onClick={() => switchType('login')}
                            >
                                返回登录
                            </button>
                        </div>
                    )}
                </div>

                {/* 版权信息 */}
                <p className="mt-6 text-center text-xs text-slate-400">Copyright © {new Date().getFullYear()} ZZX · 性能与异常监控平台</p>
            </div>
        </div>
    )
}
