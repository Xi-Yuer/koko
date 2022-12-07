
const fs = require("fs")
const path = require("path")
const snid = require("@utils/snowflake")

const { query } = require("@db/index")
const { APP_PORT, APP_HOST, BANNER_PATH } = require('@config/const')

const deletFile = require("@utils/deletFile")

const createBannderImg = async (mimetype, size, filename, title = "") => {
    const sql = `INSERT INTO banners (id, mimetype, size, filename, title) VALUES (?,?,?,?,?)`
    const id = snid.generate()
    await query(sql, [id, mimetype, size, filename, title])
}

// 保存图片
const savaBannderImg = (ctx, next) => {
    // 获取图像信息
    const files = ctx.req.files
    const { title = "" } = ctx.query
    files.forEach(async file => {
        const { mimetype, size, filename } = file
        await createBannderImg(mimetype, size, filename, title)
    })
    ctx.body = {
        tatus: 1,
        message: "上传成功"
    }
}

// 获取图片
const getBanners = async (ctx, next) => {
    const sql = "SELECT * FROM banners"
    await query(sql).then(res => {
        if (res) {
            const result = []
            res.forEach(i => {
                result.push({
                    ...i,
                    imgUrl: `${APP_HOST}/banners/${i.filename}`
                })
            })
            ctx.body = {
                status: 200,
                data: result
            }
        }
    })
}

// 通过id删除图片
const deleteBannerById = async (ctx, next) => {
    const { id } = ctx.params
    const sql = "SELECT * FROM banners WHERE id = ?"
    await query(sql, [id]).then(async ([result]) => {
        if (result) {
            const del = "DELETE FROM banners WHERE id = ?"
            await query(del, [id]).then(async res => {
                if (res.affectedRows > 0) {
                    // 删除本地文件
                    const deletePath = path.join(__dirname, "../../../../img/banner", result.filename)
                    await deletFile(deletePath)
                    ctx.body = {
                        status: 200,
                        message: "删除成功"
                    }
                }
            })
        } else {
            ctx.body = {
                status: 500,
                message: "文件不存在"
            }
        }
    })

}

// 获取图片信息流
const getSingeBanner = (ctx, next) => {
    let { filename } = ctx.params
    ctx.response.set('content-type', 'image/jpeg')
    ctx.body = fs.createReadStream(`${BANNER_PATH}/${filename}`)
}
module.exports = {
    savaBannderImg,
    getBanners,
    deleteBannerById,
    getSingeBanner
}