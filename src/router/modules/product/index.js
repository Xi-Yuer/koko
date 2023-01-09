const Router = require('koa-router')

const {
  productImgHandler,
  productBannerHandler,
} = require('@middleware/modules/file/index')
const { isAuth, isAdmin } = require('@middleware/modules/user/index')
const {
  createProduct,
  getSingeProductImg,
  deleteProduct,
  updateProduct,
  createProductBanner,
  delProductImg,
  getAllProduct,
  getProductByID,
  getBannerList,
} = require('@controller/modules/product/index')

const ProductRouter = new Router({
  prefix: '/product',
})

// 新建商品
ProductRouter.post('/create', isAuth, isAdmin, productImgHandler, createProduct)

// 商品预览图
ProductRouter.get('/:filename', getSingeProductImg)

// 删除商品
ProductRouter.delete('/delete', isAuth, isAdmin, deleteProduct)

// 修改商品
ProductRouter.post('/update', isAuth, isAdmin, productImgHandler, updateProduct)

// 添加商品的轮播图
ProductRouter.post(
  '/banner',
  isAuth,
  isAdmin,
  productBannerHandler,
  createProductBanner
)

ProductRouter.get('/banner/list', getBannerList)

// 删除商品单张轮播图
ProductRouter.delete('/banner', isAuth, isAdmin, delProductImg)

// 获取所有商品
ProductRouter.get('/', getAllProduct)

// 获取单个商品详细
ProductRouter.get('/goodsInfo/:id', getProductByID)

module.exports = ProductRouter
