const fs = require('fs')
const path = require('path')
const snid = require('@utils/snowflake')
const { query } = require('@db/index')
const deletFile = require('@utils/deletFile')

const { APP_HOST, PRODUCT_PATH } = require('@config/const')

// 创建商品
const createProduct = async (ctx, next) => {
  // 商品名称，价格，原价，商品描述，生产地址，库存，库存单位，上架状态
  const {
    product_name,
    price,
    old_price = 0,
    description = '',
    product_address = '',
    stock,
    stock_unit,
    publice_status,
    type = 0,
  } = ctx.req.body
  // // 商品预览图
  let filename = ''
  if (ctx.req.file) {
    filename = ctx.req.file.filename
  }

  const sql =
    'INSERT INTO products (id,userId, product_name, price, old_price, description, picture, product_address, stock, stock_unit, publice_status,type) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)'

  const productId = snid.generate()
  const userId = ctx.user.id // 谁添加的商品（拥有者）
  let previewImgUrl = ''
  if (filename) {
    previewImgUrl = `${APP_HOST}/product/${filename}`
  }
  await query(sql, [
    productId,
    userId,
    product_name,
    price,
    old_price,
    description,
    previewImgUrl,
    product_address,
    stock,
    stock_unit,
    publice_status,
    type,
  ])
    .then(res => {
      ctx.body = {
        status: 200,
        message: '添加成功',
      }
    })
    .catch(err => {
      ctx.body = {
        status: 401,
        message: err,
      }
    })
}

const getBannerList = async ctx => {
  const { id } = ctx.query
  const sql = 'SELECT * FROM product_img WHERE product_id = ?'

  await query(sql, [id])
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

// 获取图片信息流
const getSingeProductImg = (ctx, next) => {
  let { filename } = ctx.params
  ctx.response.set('content-type', 'image/jpeg')
  ctx.body = fs.createReadStream(`${PRODUCT_PATH}/${filename}`)
}

// 删除商品
const deleteProduct = async ctx => {
  const ProductID = ctx.query.id
  const RequestuseId = ctx.user.id
  if (!ProductID) {
    ctx.body = {
      status: 401,
      message: '请传入商品id',
    }
    return
  }
  // 根据商品id查找到该商品
  const find = 'SELECT * FROM products WHERE id = ?'
  await query(find, [ProductID]).then(async res => {
    const userId = res[0]?.userId
    const picture = res[0]?.picture
    if (picture) {
      const fileName = picture.split(`${APP_HOST}/product/`)[1]
      if (fileName) {
        const deletePath = path.join(
          __dirname,
          '../../../../img/product',
          fileName
        )
        await deletFile(deletePath)
      }
    }
    if (userId === undefined) {
      ctx.body = {
        status: 404,
        message: '商品不存在',
      }
      return
    }
    if (RequestuseId == userId) {
      const del = 'DELETE FROM products WHERE id = ?'
      await query(del, [ProductID]).then(res => {
        ctx.body = {
          status: 200,
          message: '删除成功',
        }
      })
    } else {
      ctx.body = {
        status: 401,
        message: '暂无删除该商品权限',
      }
    }
  })
}

// 修改商品
const updateProduct = async ctx => {
  // 商品名称，价格，原价，商品描述，生产地址，库存，库存单位，上架状态
  const { id } = ctx.req.body
  const productInfo = ctx.req.body

  // 商品预览图
  const filename = ctx.req?.file?.filename

  // 删除本地图片
  if (filename) {
    productInfo.picture = `${APP_HOST}/product/${filename}`
    const find = 'SELECT * FROM products WHERE id = ?'
    await query(find, [id]).then(async ([{ picture }]) => {
      const fileName = picture.split(`${APP_HOST}/product/`)[1]
      if (fileName) {
        const deletePath = path.join(
          __dirname,
          '../../../../img/product',
          fileName
        )
        await deletFile(deletePath)
      }
    })
  }

  let sql = 'UPDATE products SET '

  Object.keys(productInfo).forEach(key => {
    if (key != 'create_time' && key != 'update_time') {
      sql += ` ${key} = "${productInfo[key]}",`
    }
  })
  sql = sql.substr(0, sql.length - 1) + ' WHERE id = ?'
  await query(sql, [id])
    .then(res => {
      ctx.body = {
        status: 200,
        message: '修改成功',
      }
    })
    .catch(err => {
      ctx.body = {
        status: 500,
        message: err,
      }
    })
}

// 创建商品轮播图
const createBannderImg = async (product_id, picUrl, title = '') => {
  const sql = `INSERT INTO product_img (id, product_id, pic_url, title) VALUES (?,?,?,?)`
  const id = snid.generate()
  await query(sql, [id, product_id, picUrl, title])
}

const createProductBanner = async (ctx, next) => {
  const files = ctx.req.files
  const { productId, title } = ctx.req.body
  if (!productId) {
    ctx.body = {
      status: 401,
      message: '商品id不能为空',
    }
    return
  }
  if (files.length == 0) {
    ctx.body = {
      status: 404,
      message: '图片不能为空',
    }
    return
  }
  files.forEach(async file => {
    const { filename } = file
    const picUrl = `${APP_HOST}/product/${filename}`
    await createBannderImg(productId, picUrl, title)
  })
  ctx.body = {
    tatus: 1,
    message: '上传成功',
  }
}

// 删除单张轮播图
const delProductImg = async (ctx, next) => {
  const { id } = ctx.query
  if (!id) {
    ctx.body = {
      status: 401,
      message: '商品id不能为空',
    }
  } else {
    const find = 'SELECT * FROM product_img WHERE id = ?'
    await query(find, [id]).then(async res => {
      if (res.length === 0) {
        ctx.body = {
          status: 500,
          message: '图片不存在',
        }
        return
      }

      const [{ pic_url }] = res

      const fileName = pic_url.split(`${APP_HOST}/product/`)[1]

      if (fileName) {
        const deletePath = path.join(
          __dirname,
          '../../../../img/product',
          fileName
        )
        await deletFile(deletePath)

        const sql = 'DELETE FROM product_img WHERE id = ?;'
        await query(sql, [id])
          .then(res => {
            ctx.body = {
              status: 200,
              message: '删除成功',
            }
          })
          .catch(err => {
            ctx.body = {
              status: 500,
              message: err,
            }
          })
      }
    })
  }
}

// 获取所有商品
const getAllProduct = async ctx => {
  const { limit = 10, offset = 0, asc = 0, type } = ctx.query

  let count
  const countSql = 'SELECT count(*) count FROM  products WHERE type = ?'
  await query(countSql, [type]).then(([res]) => {
    count = res.count
  })

  if (!type) {
    const sql = `SELECT * FROM  products ORDER BY price ${
      asc == 0 ? 'ASC' : 'DESC'
    } LIMIT ?, ?`
    await query(sql, [+offset, +limit]).then(res => {
      ctx.body = {
        status: 200,
        message: 'ok',
        data: res,
        count,
      }
    })
  } else {
    const sql = `SELECT * FROM  products WHERE type = ? ORDER BY price ${
      asc == 0 ? 'ASC' : 'DESC'
    } LIMIT ?, ?`
    await query(sql, [type, +offset, +limit]).then(res => {
      ctx.body = {
        status: 200,
        message: 'ok',
        data: res,
        count,
      }
    })
  }
}
// 获取甲鱼

// 获取单个商品
const getProductByID = async ctx => {
  const { id } = ctx.params
  if (!id) {
    ctx.body = {
      status: 404,
      message: 'id不能为空',
    }
  }
  const sql = `
    SELECT
	p.id, p.userId, p.product_name, p.price, p.old_price, p.picture, p.description, p.product_address, p.stock, p.stock_unit, p.sale_count,
    p.publice_status,p.create_time,p.update_time,
	JSON_ARRAYAGG(
		JSON_OBJECT( 'id', product_img.id, 'url', product_img.pic_url, 'title', product_img.title, 'productid', product_img.product_id)
	) banners
    FROM
        products p
    LEFT JOIN product_img ON product_img.product_id = p.id
    WHERE
        p.id = ?;
    `

  await query(sql, [id]).then(res => {
    ctx.body = {
      data: res,
    }
  })
}


module.exports = {
  createProduct,
  getSingeProductImg,
  deleteProduct,
  updateProduct,
  createProductBanner,
  delProductImg,
  getAllProduct,
  getProductByID,
  getBannerList,
}
