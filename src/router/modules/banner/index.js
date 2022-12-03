const Router = require("koa-router")

const { bannerHandler } = require("@middleware/modules/file/index")
const { savaBannderImg, deleteBannerById, getBanners, getSingeBanner } = require("@controller/modules/banner/index")
const { isAdmin } = require("@middleware/modules/user/index")

const BannerRouter = new Router({
    prefix: "/banners"
})

// 上传轮播图
BannerRouter.post("/upload", isAdmin, bannerHandler, savaBannderImg)
// 删除轮播图
BannerRouter.delete("/:id", isAdmin, deleteBannerById)
// 获取所有的轮播图
BannerRouter.get("/getAll", getBanners)
// 获取图片的信息流
BannerRouter.get("/:filename", getSingeBanner)

module.exports = BannerRouter

