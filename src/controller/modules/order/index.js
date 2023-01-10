const { query } = require("@db/index")
const postMessage = require("@utils/message")

const snid = require("@utils/snowflake")

// 创建订单
const createOrder = async ctx => {
    const { id: userId } = ctx.user // 用户id
    const { product_id, realname, address, mobile, amount, note, total_price } = ctx.request.body // 订单信息
    const orderId = snid.generate() // 订单id
    const odrderStatus = 1 // 订单状态

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

// 修改订单状态
const payOrder = async ctx => {

    // 订单状态
    /**
     *  1：未支付
     *  2：已支付
     *  3：运输中
     *  4：已签收
     */
    const { orderId, orderStatus = 1 } = ctx.request.body
    const sql = "UPDATE `order` SET order_status = ? WHERE id = ?;"

    // TOOD(订单已支付 orderStatus = 2)

    if (!ctx.user) {
        ctx.body = {
            status: 403,
            message: "请先登录"
        }
        return
    }

    await query(sql, [orderStatus, orderId]).then(async res => {

        // 发送短信
        // TOOD(订单支付成功，发送短信通知商家发货)
        if (orderStatus == 2) {
            await postMessage("18483128820")
        }
        ctx.body = {
            status: 200,
            message: "订单状态已修改"
        }
    }).catch(err => {
        ctx.body = {
            status: 401,
            err: err,
            message: "订单不存在"
        }
    })
}

// 获取某个用户的订单(用户)
const userOrder = async ctx => {
    const { id } = ctx.user
    if (!id) {
        ctx.body = {
            status: 401,
            message: "请先登录"
        }
    } else {
        const sql = "SELECT * FROM `order` WHERE user_id = ?;"
        await query(sql, [id]).then(res => {
            ctx.body = {
                status: 200,
                message: "ok",
                data: res
            }
        }).catch(err => {
            ctx.body = {
                status: 500,
                menubar: err
            }
        })
    }
}

// 加入购物车
const IntoCar = async (ctx) => {
    const { price, count, productID } = ctx.request.body
    const { id } = ctx.user
    const orderId = snid.generate() // 订单id
    const find = "SELECT * FROM products WHERE id = ?"
    await query(find, [productID]).then(async ([product]) => {
        const productResult = JSON.stringify(product)
        const sql = "INSERT INTO shopping_car (id,user_id,price,count,product) VALUES (?,?,?,?,?)"
        await query(sql, [orderId, id, price, count, productResult]).then(res => {
            ctx.body = {
                status: 200,
                message: "加入购物车成功"
            }
        }).catch(err => {
            ctx.body = {
                status: 500,
                message: err
            }
        })
    })
}

// 获取用户购物车里的订单
const getCarOrder = async ctx => {
    const { id } = ctx.user
    const sql = "SELECT * FROM shopping_car WHERE user_id = ?"
    await query(sql, [id]).then(res => {
        const result = res.map(i => {
            return {
                ...i,
                product:JSON.parse(i.product)
            }
        })
        ctx.body = {
            status: 200,
            message: "ok",
            data: result
        }
    }).catch(err => {
        ctx.body = {
            status: 500,
            message: err
        }
    })
}

// 获取所有订单(管理员使用根据传值)
const OrderList = async ctx => {
    const { orderStatus, userId } = ctx.request.body

    let sql
    let queryArr
    // 当查询某个用户查询某个状态下的订单
    if (orderStatus && userId) {
        sql = "SELECT * FROM `order` WHERE user_id = ? AND order_status = ?"
        queryArr = [userId, orderStatus]
    }
    // 有状态,没有用户id就是根据句订单状态查询所有订单
    if (orderStatus && !userId) {
        sql = "SELECT * FROM `order` WHERE  order_status= ?"
        queryArr = [orderStatus]
    }
    // 有用户id 没有状态就是查询用户全部订单
    if (!orderStatus && userId) {
        sql = "SELECT * FROM `order` WHERE user_id = ?"
        queryArr = [userId]
    }
    if (!orderStatus && !userId) {
        sql = "SELECT *FROM `order`"
    }
    await query(sql, queryArr).then(res => {
        ctx.body = {
            status: 200,
            message: "ok",
            data: res
        }
    }).catch(err => {
        ctx.body = {
            status: 500,
            message: err
        }
    })

}
module.exports = {
    createOrder,
    payOrder,
    userOrder,
    OrderList,
    IntoCar,
    getCarOrder
}