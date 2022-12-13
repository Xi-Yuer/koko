const UserRouter = require('./modules/user/index')
const BannerRouter = require('./modules/banner/index')
const ProductRouter = require('./modules/product/index')
const OrderRouter = require('./modules/order/index')
const MenuRouter = require('./modules/menu/index')
const MenuOrderRouter = require('./modules/menu_order/index')

module.exports = {
  UserRouter,
  BannerRouter,
  ProductRouter,
  OrderRouter,
  MenuRouter,
  MenuOrderRouter,
}
