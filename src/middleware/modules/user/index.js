const jwt = require("jsonwebtoken")
const { privateKey } = require('@config/jwt')

//  token 是否正确
const isAuth = async (ctx, next) => {
    // 获取token
    const authorization = ctx.headers.authorization
    const token = authorization?.replace('Bearer ', '')
    try {
        const result = jwt.verify(token, privateKey)
        ctx.user = result
        try {
            await next()
        } catch (error) {
            ctx.body = {
                status: 403,
                message: "isAuth中间件下游路由出现错误"
            }
        }
    } catch (error) {
        ctx.body = {
            status: 403,
            message: "isAuth:token验证失败"
        }
    }
}

// 证明我是我或者是管理员
const isMe = async (ctx, next) => {
    const { id: tokenID, is_admin } = ctx.user
    const { id: qureyID } = ctx.request.body
    if (tokenID == qureyID || is_admin == 1) {
        return await next()
    } else {
        ctx.body = {
            status: 401,
            message: "isMe:暂无权限"
        }
    }
}

// 是否是管理员
const isAdmin = async (ctx, next) => {
    // 获取token
    const authorization = ctx.headers.authorization
    const token = authorization?.replace('Bearer ', '')
    try {
        const result = jwt.verify(token, privateKey)
        if (result.is_admin == 1) {
            try {
                return await next()
            } catch (error) {
                ctx.body = {
                    status: 401,
                    message: "isAdmin 中间件下游的路由出现的问题"
                }
            }
        } else {
            ctx.body = {
                status: 403,
                message: "用户暂无权限"
            }
            return
        }
    } catch (error) {
        ctx.body = {
            status: 403,
            message: "token验证失败"
        }
        return
    }
}

module.exports = {
    isAuth,
    isAdmin,
    isMe
}