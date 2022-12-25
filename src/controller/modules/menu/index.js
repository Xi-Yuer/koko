const fs = require('fs')
const path = require('path')

const snid = require('@utils/snowflake')
const deletFile = require('@utils/deletFile')
const { APP_HOST, MENNU_PATH } = require('@config/const')
const { query } = require('@db/index')

const createMenu = async ctx => {
  const { menu_name, price, description, material, taste, makein, discount } =
    ctx.req.body
  const { filename, mimetype, size } = ctx.req.file
  const menueID = snid.generate()
  const pictureURL = `${APP_HOST}/menu/${filename}`

  const sql =
    'INSERT INTO menus (id, menu_name, price, description, picture, material, taste, makein, discount) VALUES (?,?,?,?,?,?,?,?,?)'

  await query(sql, [
    menueID,
    menu_name,
    price,
    description,
    pictureURL,
    material,
    taste,
    makein,
    discount,
  ])
    .then(res => {
      ctx.body = {
        status: 200,
        message: '创建成功',
      }
    })
    .catch(err => {
      ctx.body = {
        status: 500,
        message: err,
      }
    })
}
const getBannerList = async ctx => {
  const { id } = ctx.query
  const sql = 'SELECT * FROM menu_img WHERE menu_id = ?'

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

const previewMenuImg = ctx => {
  let { filename } = ctx.params
  ctx.response.set('content-type', 'image/jpeg')
  ctx.body = fs.createReadStream(`${MENNU_PATH}/${filename}`)
}

const deleteMenu = async ctx => {
  const { id } = ctx.query
  if (!id) {
    ctx.body = {
      status: 403,
      message: 'id不能为空',
    }
    return
  } else {
    const find = 'SELECT * FROM menus WHERE id = ?'
    await query(find, [id]).then(async res => {
      if (res.length <= 0) {
        ctx.body = {
          status: 403,
          message: '菜品不存在',
        }
      } else {
        const { picture } = res[0]
        if (picture) {
          const fileName = picture.split(`${APP_HOST}/menu/`)[1]
          if (fileName) {
            const deletePath = path.join(
              __dirname,
              '../../../../img/menu',
              fileName
            )
            await deletFile(deletePath)
          }
        }
        const del = 'DELETE FROM menus WHERE id =?'
        await query(del, [id])
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

const updateMenu = async ctx => {
  const { id } = ctx.req.body
  const menuInfo = ctx.req.body

  // 商品预览图
  const filename = ctx.req?.file?.filename
  if (!id) {
    ctx.body = {
      status: 403,
      message: 'id不能为空',
    }
    return
  } else {
    // 删除本地图片
    if (filename) {
      menuInfo.picture = `${APP_HOST}/menu/${filename}`
      const find = 'SELECT * FROM menus WHERE id = ?'
      await query(find, [id])
        .then(async res => {
          if (res.length === 0) {
            ctx.body = {
              status: 403,
              message: '菜品不存在',
            }
            return
          }
          const [{ picture }] = res
          if (picture) {
            const fileName = picture.split(`${APP_HOST}/menu/`)[1]
            if (fileName) {
              const deletePath = path.join(
                __dirname,
                '../../../../img/menu/',
                fileName
              )
              await deletFile(deletePath)
            }
          }
        })
        .catch(err => {
          ctx.body = {
            status: 500,
            message: err,
          }
        })
    }

    let sql = 'UPDATE menus SET '

    Object.keys(menuInfo).forEach(key => {
      if (key != 'create_time' && key != 'update_time') {
        sql += ` ${key} = "${menuInfo[key]}",`
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
}

const getMenuList = async ctx => {
  const { limit = 10, offset = 0, asc = 0 } = ctx.query

  let count
  const countSql = 'SELECT count(*) count FROM menus'
  await query(countSql).then(([res]) => {
    count = res.count
  })

  const sql = `SELECT * FROM menus ORDER BY price ${
    asc == 0 ? 'ASC' : 'DESC'
  } LIMIT ?, ?`
  await query(sql, [+offset, +limit])
    .then(res => {
      ctx.body = {
        status: 200,
        message: 'ok',
        data: res,
        count,
      }
    })
    .catch(err => {
      ctx.body = {
        status: 500,
        message: err,
      }
    })
}

const createBannderImg = async (product_id, picUrl, title = '') => {
  const sql = `INSERT INTO menu_img (id, menu_id, pic_url, title) VALUES (?,?,?,?)`
  const id = snid.generate()
  await query(sql, [id, product_id, picUrl, title])
}
const createMenuBanner = async ctx => {
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
    const picUrl = `${APP_HOST}/menu/${filename}`
    await createBannderImg(productId, picUrl, title)
  })
  ctx.body = {
    tatus: 1,
    message: '上传成功',
  }
}

const getMenuByID = async ctx => {
  const { id } = ctx.params
  if (!id) {
    ctx.body = {
      status: 404,
      message: 'id不能为空',
    }
  }
  const sql = `
    SELECT
	m.id, m.menu_name, m.price, m.picture, m.description, m.material, m.taste, m.makein, m.discount,m.create_time,m.update_time,
	JSON_ARRAYAGG(
		JSON_OBJECT( 'id', menu_img.id, 'url', menu_img.pic_url, 'title', menu_img.title, 'menuid', menu_img.menu_id)
	) banners
    FROM
        menus m
    LEFT JOIN menu_img ON menu_img.menu_id = m.id
    WHERE
        m.id = ?;
    `

  await query(sql, [id]).then(res => {
    ctx.body = {
      data: res,
    }
  })
}

const delMenuImg = async (ctx, next) => {
  const { id } = ctx.query
  if (!id) {
    ctx.body = {
      status: 401,
      message: 'id不能为空',
    }
  } else {
    const find = 'SELECT * FROM menu_img WHERE id = ?'
    await query(find, [id]).then(async res => {
      if (res.length === 0) {
        ctx.body = {
          status: 500,
          message: '图片不存在',
        }
        return
      }

      const [{ pic_url }] = res

      const fileName = pic_url.split(`${APP_HOST}/menu/`)[1]

      if (fileName) {
        const deletePath = path.join(
          __dirname,
          '../../../../img/menu',
          fileName
        )
        await deletFile(deletePath)

        const sql = 'DELETE FROM menu_img WHERE id = ?;'
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

module.exports = {
  createMenu,
  previewMenuImg,
  deleteMenu,
  updateMenu,
  getMenuList,
  createMenuBanner,
  getMenuByID,
  delMenuImg,
  getBannerList,
}
