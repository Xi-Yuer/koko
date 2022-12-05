

const createOrder = async ctx => {
    // const info = ctx.req.body
    // console.log(info) // undefined
    console.log(ctx.request.body)
}


module.exports = {
    createOrder
}