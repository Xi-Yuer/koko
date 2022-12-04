const Multer = require("koa-multer")

const { AVATAR_PATH, BANNER_PATH, PRODUCT_PATH } = require('@config/const')

// 多张轮播图
const bannerUpload = Multer({ dest: BANNER_PATH })
const bannerHandler = bannerUpload.array('banner', 20)


// 单张头像
const avatarUpload = Multer({ dest: AVATAR_PATH })
const avatarHandler = avatarUpload.single("avatar")

// 单张商品预览图
const productUpload = Multer({ dest: PRODUCT_PATH })
const productImgHandler = productUpload.single("picture")

// 多张商品轮播图
const productBannerUpload = Multer({ dest: PRODUCT_PATH })
const productBannerHandler = productBannerUpload.array("banner", 10)

module.exports = {
    bannerHandler,
    avatarHandler,
    productImgHandler,
    productBannerHandler
}