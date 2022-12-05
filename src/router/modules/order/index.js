const Router = require("koa-router")

const { isAuth } = require("@middleware/modules/user/index")

const { createOrder, payOrder } = require("@controller/modules/order/index")

const OrderRouter = new Router({
    prefix: "/order"
})


// 创建订单
OrderRouter.post("/create", isAuth, createOrder)

// 支付订单
OrderRouter.post("/pay", isAuth, payOrder)









module.exports = OrderRouter