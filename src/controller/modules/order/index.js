const { query } = require("@db/index")

const snid = require("@utils/snowflake")

// 创建订单
const createOrder = async ctx => {
    const { id: userId } = ctx.user // 用户id
    const { product_id, realname, address, mobile, amount, note, total_price } = ctx.request.body // 订单信息
    const orderId = snid.generate() // 订单id
    const odrderStatus = 0 // 订单状态

    // 用户提交订单信息
    const sql = "INSERT INTO `order` (id, user_id, product_id, realname,address, mobile,amount, note,total_price,order_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);"

    await query(sql, [orderId, userId, product_id, realname, address, mobile, amount, note, total_price, odrderStatus]).then(res => {
        ctx.body = {
            status: 200,
            message: "生成订单成功"
        }
    }).catch(err => {
        ctx.body = {
            status: 500,
            message: "参数不正确"
        }
    })

}

// 支付订单
const payOrder = async ctx => {
    const { orderId } = ctx.request.body
    const sql = "UPDATE `order` SET order_status = 1 WHERE id = ?;"

    // TOOD(订单已支付)

    if (!ctx.user) {
        ctx.body = {
            status: 403,
            message: "请先登录"
        }
        return
    }

    await query(sql, [orderId]).then(res => {
        ctx.body = {
            status: 200,
            message: "支付成功"
        }
    }).catch(err => {
        ctx.body = {
            status: 401,
            err: err,
            message: "订单不存在"
        }
    })
}


module.exports = {
    createOrder,
    payOrder
}