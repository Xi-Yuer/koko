const snid = require('@utils/snowflake')
const { query } = require('@db/index')

// 创建订单
const create = async ctx => {
  const { id: userID } = ctx.user
  const { orderTime, dishids, orderTotal, Remark } = ctx.request.body

  const id = snid.generate()

  const sql =
    'INSERT INTO menu_order(id, user_id, order_time, dish_ids, order_total, remark) VALUES (?,?,?,?,?,?)'

  await query(sql, [id, userID, orderTime, dishids, orderTotal, Remark])
    .then(res => {
      ctx.body = {
        status: 200,
        message: '生成订单成功',
      }
    })
    .catch(err => {
      ctx.body = {
        status: 500,
        message: err,
      }
    })
}

// 查询用户所有订单
const getUserOrderList = async ctx => {
  const { id: UserID } = ctx.user

  const sql = 'SELECT * FROM menu_order WHERE user_id = ?'

  await query(sql, [UserID])
    .then(res => {
      ctx.body = {
        status: 200,
        message: 'ok',
        data: res,
      }
    })
    .catch(err => {
      ctx.body = {
        status: 500,
        message: err,
      }
    })
}

// 查询订单详细信息
const getOrderDetail = async ctx => {
  const { orderID } = ctx.request.body

  const find = 'SELECT * FROM menu_order WHERE id = ?'

  await query(find, [orderID])
    .then(async res => {
      if (!res) return
      const { dish_ids } = res[0]
      const dishArr = dish_ids.split(',')

      const find = 'SELECT * FROM menus WHERE id = ?'
      let result
      await Promise.all(
        dishArr.map(i => {
          return new Promise(async (resolve, reject) => {
            await query(find, [i])
              .then(res => {
                if (res.length <= 0) {
                  reject('菜品信息不存在')
                }
                if (!res) return
                resolve(res[0])
              })
              .catch(err => {
                reject(err)
              })
          })
        })
      ).then(res => {
        result = res
      })
      ctx.body = {
        status: 200,
        message: 'ok',
        data: { ...res[0], menu_item: result },
      }
    })
    .catch(err => {
      ctx.body = {
        status: 500,
        message: err,
      }
    })
}

// 支付订单
const payedOrder = async ctx => {
  const { orderID } = ctx.request.body

  const find = 'SELECT * FROM menu_order WHERE id =?'

  await query(find, [orderID])
    .then(async res => {
      const update = 'UPDATE menu_order SET order_status = 1 WHERE id = ?'

      await query(update, [orderID])
        .then(res => {
          ctx.body = {
            status: 200,
            message: '支付成功',
          }
        })
        .catch(err => {
          ctx.body = {
            status: 500,
            message: err,
          }
        })
    })
    .catch(err => {
      ctx.body = {
        status: 500,
        message: err,
      }
    })
}

module.exports = {
  create,
  getUserOrderList,
  getOrderDetail,
  payedOrder,
}
