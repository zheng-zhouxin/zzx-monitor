import React from 'react'
import { Navigate } from 'react-router-dom'

interface AuthRouteProps {
    children: JSX.Element
}

const AuthRoute: React.FC<AuthRouteProps> = ({ children }) => {
    // 如果用户没有登录，重定向到登录页面（带 redirect 参数）
    if (!localStorage.getItem('token')) {
        return <Navigate to={`account/login?redirect=${window.location.pathname}`} />
    }
    // 已登录则渲染子组件
    return children
}

export default AuthRoute
