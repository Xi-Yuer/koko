const Router = require('koa-router')

const {
    menuImgHandler,
    menuBannerHandler,
} = require('@middleware/modules/file/index')
const { isAuth, isAdmin } = require('@middleware/modules/user/index')

const {
    createMenu,
    previewMenuImg,
    deleteMenu,
    updateMenu,
    getMenuList,
    createMenuBanner,
    getMenuByID,
    delMenuImg,
} = require('@controller/modules/menu/index')

const MenuRouter = new Router({
    prefix: '/menu',
})

// 新建菜品（id, 名字，价格，图片轮播，描述，状态，商品原料，口味，制作方式，折扣）
MenuRouter.post('/create', isAuth, isAdmin, menuImgHandler, createMenu)

// 删除菜品
MenuRouter.delete('/delete', isAuth, isAdmin, deleteMenu)

// 修改菜品
MenuRouter.post('/update', isAuth, isAdmin, menuImgHandler, updateMenu)

// 添加商品轮播图
MenuRouter.post('/banner', isAuth, isAdmin, menuBannerHandler, createMenuBanner)

// 删除菜品轮播图
MenuRouter.delete('/banner', isAuth, isAdmin, delMenuImg)

// 获取所有菜品
MenuRouter.get('/list', getMenuList)

// 获取菜品详细（包含轮播图）
MenuRouter.get('/menuInfo/:id', getMenuByID)

// 获取菜品图片信息流
MenuRouter.get('/:filename', previewMenuImg)

module.exports = MenuRouter
