const Router = require("koa-router")

const {
    getAllUser,
    userRegister,
    userLogin,
    updateUserInfo,
    deleteUser
} = require('@controller/modules/user/index')

const { isAuth, isAdmin, isMe } = require('@middleware/modules/user/index')

const UserRouter = new Router({
    prefix: "/user"
})

// 获取所有的用户
UserRouter.get("/", getAllUser)

// 用户注册
UserRouter.post("/register", userRegister)

// 用户登录
UserRouter.post("/login", userLogin)

// 用户修改信息
UserRouter.post("/update", isAuth, isMe, updateUserInfo)

// 删除用户
UserRouter.delete("/delete", isAuth, isAdmin, deleteUser)

module.exports = UserRouter