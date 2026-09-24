import { useLayoutEffect } from 'react'
import { Outlet } from 'react-router-dom'

import { Aside } from '@/components/LayoutAside/Aside'

export function Layout() {
    useLayoutEffect(() => {
        // 二次保险：布局层也检查 token，防止 AuthRoute 与 Layout 渲染时序导致的空白页
        if (!localStorage.getItem('token')) {
            window.location.href = `/account/login?redirect=${window.location.pathname}`
        }
    }, [])
    return (
        <div className="grid h-screen w-full grid-cols-[280px_1fr]">
            <Aside />
            <div className="flex flex-col overflow-y-auto relative">
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
