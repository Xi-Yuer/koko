const Multer = require("koa-multer")

const { AVATAR_PATH, BANNER_PATH } = require('@config/const')

// 多张轮播图
const bannerUpload = Multer({ dest: BANNER_PATH })
const bannerHandler = bannerUpload.array('banner', 20)


// 单张头像
const avatarUpload = Multer({ dest: AVATAR_PATH })
const avatarHandler = avatarUpload.single("avatar")

module.exports = {
    bannerHandler,
    avatarHandler
}