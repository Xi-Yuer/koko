const Router = require("koa-router")

const {
    wxLogin,
    getAllUser,
    getUserInfoById,
    userRegister,
    userLogin,
    updateUserInfo,
    deleteUser,
    updateUserAvatar,
    getSingeAvatar
} = require('@controller/modules/user/index')

const { isAuth, isAdmin, isMe } = require('@middleware/modules/user/index')
const { avatarHandler } = require("@middleware/modules/file/index")

const UserRouter = new Router({
    prefix: "/user",

})

// 微信登录
UserRouter.post("/Login",wxLogin)

// 获取所有的用户
UserRouter.get("/getAllUsers", isAdmin, getAllUser)

// 获取单个用户的信息
UserRouter.get("/info/:id", getUserInfoById)

// 用户注册
UserRouter.post("/register", userRegister)

// 用户登录
UserRouter.post("/login", userLogin)

// 用户修改信息
UserRouter.post("/update", isAuth, isMe, updateUserInfo)

// 修改用户头像 
UserRouter.post("/avatar", isAuth, avatarHandler, updateUserAvatar)

// 获取用户头像
UserRouter.get("/avatar/:filename", getSingeAvatar)

// 删除用户
UserRouter.delete("/delete", isAuth, isAdmin, deleteUser)

module.exports = UserRouter