const Router = require("koa-router")

const { menuImgHandler } = require('@middleware/modules/file/index')
const { isAuth, isAdmin } = require('@middleware/modules/user/index')


const { createMenu } = require("@controller/modules/menu/index")

const MenuRouter = new Router({
    prefix: "/menu"
})


// 新建菜品（id, 名字，价格，图片轮播，描述，状态，商品原料，口味，制作方式，折扣）
MenuRouter.post("/create", isAuth, isAdmin, menuImgHandler, createMenu)


// 删除菜品



// 修改菜品


// 添加商品轮播图


// 删除菜品轮播图


// 获取所有菜品


// 获取菜品详细（包含轮播图）


// 获取菜品图片信息流


module.exports = MenuRouter