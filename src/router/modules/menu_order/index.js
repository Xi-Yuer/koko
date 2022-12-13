const Router = require('koa-router')

const { isAuth } = require('@middleware/modules/user/index')
const {
  create,
  getUserOrderList,
  getOrderDetail,
  payedOrder,
} = require('@controller/modules/menu_order/index')

const MenuOrderRouter = new Router({
  prefix: '/menu',
})

// 创建订单
MenuOrderRouter.post('/order', isAuth, create)

// 查询用户所有订单信息
MenuOrderRouter.get('/order/list', isAuth, getUserOrderList)

// 查询用户单个订单信息
MenuOrderRouter.get('/order/detail', isAuth, getOrderDetail)

// 支付订单
MenuOrderRouter.post('/order/pay', isAuth, payedOrder)

module.exports = MenuOrderRouter
