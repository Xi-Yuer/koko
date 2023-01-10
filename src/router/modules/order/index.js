const Router = require("koa-router")

const { isAuth, isAdmin } = require("@middleware/modules/user/index")

const { createOrder, payOrder, userOrder, OrderList,IntoCar } = require("@controller/modules/order/index")

const OrderRouter = new Router({
    prefix: "/order"
})



// 创建订单
OrderRouter.post("/create", isAuth, createOrder)

// 支付订单
OrderRouter.post("/pay", isAuth, payOrder)

// 获取订单（用户）
OrderRouter.get("/orderList", isAuth, userOrder)

// 获取订单（管理员）
OrderRouter.get("/all", isAdmin, OrderList)

// 加入购物车
OrderRouter.post("/intoCar", isAuth, IntoCar)









module.exports = OrderRouter