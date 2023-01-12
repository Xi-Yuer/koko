const md5 = require('md5')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const path = require('path')
const axios = require('axios')

const { PRIVATE_KEY, EXPIRESIN, APP_ID, SECRET } = require('@config/const')
const { query } = require('@db/index')
const snid = require('@utils/snowflake')
const isPhoneNumber = require('@utils/isPhoneNumber')
const isCorrectPassword = require('@utils/isCorrectPassword')
const deletFile = require('@utils/deletFile')

const { APP_HOST, AVATAR_PATH } = require('@config/const')


// 获取所有用户,管理员才能获取
const getAllUser = async ctx => {
  const sql = 'SELECT * FROM users'
  await query(sql).then(res => {
    ctx.body = {
      status: 200,
      message: 'ok',
      data: res,
    }
  })
}

// 获取用户信息
const getUserInfoById = async ctx => {
  const { id } = ctx.params
  const sql =
    'SELECT id, name, phone_number, avatar, gender, asign, is_admin, birthday, is_vip FROM users WHERE id = ?'
  await query(sql, [id]).then(res => {
    if (res.length > 0) {
      ctx.body = {
        status: 200,
        message: 'ok',
        data: res[0],
      }
    } else {
      ctx.body = {
        status: 200,
        message: '用户不存在',
      }
    }
  })
}

// 用户注册
const userRegister = async (ctx, next) => {
  // 生成一个随机名字充当默认值
  const radomName = Math.random().toString(36).slice(-8)
  const { phone, password, name = radomName, gender = 0 } = ctx.request.body
  if (!phone || !password) {
    ctx.body = {
      status: 0,
      message: '手机号或密码不能为空',
    }
  } else {
    const isPhoneNumberFlag = isPhoneNumber(phone)
    if (!isPhoneNumberFlag) {
      ctx.body = {
        status: 400,
        message: '手机号格式错误',
      }
      return
    }
    const passwordIsCorrect = isCorrectPassword(password)
    if (!passwordIsCorrect) {
      ctx.body = {
        status: 401,
        message: '密码只能是数字和字母的6-18位组合',
      }
      return
    }
    const findSql = 'SELECT * FROM users WHERE phone_number = ?'
    await query(findSql, [phone]).then(async res => {
      if (res.length) {
        ctx.body = {
          status: 401,
          message: '手机号已存在',
        }
      } else {
        const sql =
          'INSERT INTO users (id, phone_number, password, name, gender) VALUES (?,?,?,?,?)'
        // 生成唯一id
        const id = snid.generate()
        await query(sql, [id, phone, md5(password), name, gender]).then(res => {
          if (res.affectedRows) {
            ctx.body = {
              status: 200,
              message: '注册成功',
            }
          }
        })
      }
    })
  }
}

// 用户登录
const userLogin = async (ctx, next) => {
  const { phone, password } = ctx.request.body
  if (!phone || !password) {
    ctx.body = {
      status: 0,
      message: '用户或密码不能为空',
    }
  } else {
    const sql = 'select * from users where phone_number = ?'
    await query(sql, phone).then(([res]) => {
      if (res && res.password == password) {
        // 将用户敏感数据和不必要的数据去除掉生成 token
        const filterUserInfo = { ...res, password: '', avatar: '', asign: '' }
        const token = jwt.sign(
          filterUserInfo,
          PRIVATE_KEY,
          { expiresIn: EXPIRESIN },
          { algorithm: 'RS256' }
        )
        ctx.body = {
          status: '200',
          token: token,
          data: { ...res, password: '' },
          message: '登录成功,欢迎回来！',
        }
      } else {
        ctx.body = {
          status: '401',
          message: '手机号或密码错误',
        }
      }
    })
  }
}

// 更新用户信息
const updateUserInfo = async ctx => {
  const qureyUserInfo = ctx.request.body

  // 先根据用户id查询出来用户原始信息
  if (!qureyUserInfo.id) {
    ctx.body = {
      status: 401,
      message: '用户id不能为空',
    }
    return
  } else {
    const find = 'SELECT * FROM users WHERE id = ?'
    await query(find, [qureyUserInfo.id]).then(async res => {
      if (res.length > 0) {
        let sql = 'UPDATE users SET '

        Object.keys(qureyUserInfo).forEach(key => {
          if (key === 'password') {
            sql += ` ${key} = "${md5(qureyUserInfo[key])}",`
          } else {
            if (qureyUserInfo[key]) {
              sql += ` ${key} = "${qureyUserInfo[key]}",`
            }
          }
        })

        sql = sql.substr(0, sql.length - 1) + ' WHERE id = ?'

        await query(sql, [qureyUserInfo.id]).then(res => {
          if (res.affectedRows) {
            ctx.body = {
              status: 200,
              message: '修改成功',
            }
            return
          }
        })
      } else {
        ctx.body = {
          status: 404,
          message: '用户不存在',
        }
      }
    })
  }
}

// 删除用户
const deleteUser = async ctx => {
  const { id } = ctx.request.query

  const find = 'SELECT COUNT(*) AS count FROM users WHERE id = ?'

  await query(find, [id]).then(async ([res]) => {
    if (res.count > 0) {
      // 用户存在，可以删除用户
      const sql = 'DELETE FROM users WHERE id = ?'
      return await query(sql, [id]).then(({ affectedRows }) => {
        if (affectedRows >= 1) {
          ctx.body = {
            status: 200,
            message: '删除用户成功',
          }
        } else {
          ctx.body = {
            status: 500,
            message: '删除用户失败',
          }
        }
      })
    } else {
      ctx.body = {
        status: 404,
        message: '用户不存在',
      }
    }
  })
}

// 更新用户头像
const updateUserAvatar = async (ctx, next) => {
  // 获取上传的头像信息。
  const { filename } = ctx.req.file
  const userId = ctx.user.id

  // 更新用户头像字段信息
  const find = 'SELECT * FROM users WHERE id = ?'
  await query(find, [userId]).then(async ([{ avatar }]) => {
    const fileName = avatar.split(`${APP_HOST}/user/avatar/`)[1]
    if (fileName) {
      const deletePath = path.join(
        __dirname,
        '../../../../img/avatar',
        fileName
      )
      await deletFile(deletePath)
    }
  })

  const sql = 'UPDATE users SET avatar = ? WHERE id = ?'
  const avatarUrl = `${APP_HOST}/user/avatar/${filename}`
  await query(sql, [avatarUrl, userId]).then(async res => {
    if (res.affectedRows > 0) {
      // 删除本地文件
      ctx.body = {
        status: 200,
        message: '修改成功',
      }
    } else {
      ctx.body = {
        status: 500,
        message: '修改失败',
      }
    }
  })
}

// 获取图片信息流
const getSingeAvatar = (ctx, next) => {
  let { filename } = ctx.params
  ctx.response.set('content-type', 'image/jpeg')
  ctx.body = fs.createReadStream(`${AVATAR_PATH}/${filename}`)
}

// 微信登录
const wxLogin = async ctx => {
  const { phoneCode, openidCode } = ctx.request.body
  const OpenIdResult = await axios.get(`
  https://api.weixin.qq.com/sns/jscode2session?appid=${APP_ID}&secret=${SECRET}&js_code=${openidCode}&grant_type=authorization_code`)

  const AccessTokenResult = await axios.get(`
  https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APP_ID}&secret=${SECRET}`)

  const PhoneResult = await axios.post(`
  https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${AccessTokenResult.data.access_token}`,
    {
      code: phoneCode
    })

  const openid = OpenIdResult.data.openid
  const phone = PhoneResult.data.phone_info.phoneNumber

  const find = 'select * from users where phone_number = ?'

  await query(find, [phone]).then(async res => {
    if (res.length > 0) {
      const sql = 'select * from users where phone_number = ?'
      await query(sql, phone).then(([res]) => {
        // 将用户敏感数据和不必要的数据去除掉生成 token
        const filterUserInfo = { ...res, password: '', avatar: '', asign: '' }
        const token = jwt.sign(
          filterUserInfo,
          PRIVATE_KEY,
          { expiresIn: EXPIRESIN },
          { algorithm: 'RS256' }
        )
        ctx.body = {
          status: '200',
          token: token,
          data: { ...res, password: '' },
          message: '登录成功,欢迎回来！',
        }
      })
    } else {
      const sql =
        'INSERT INTO users (id, phone_number, password, name, gender) VALUES (?,?,?,?,?)'
      // 生成唯一id
      const id = snid.generate()
      const radomName = Math.random().toString(36).slice(-8)
      await query(sql, [id, phone, md5(openid), radomName, 0]).then(async res => {
        if (res.affectedRows) {
          const sql = 'select * from users where phone_number = ?'
          await query(sql, phone).then(([res]) => {
            // 将用户敏感数据和不必要的数据去除掉生成 token
            const filterUserInfo = { ...res, password: '', avatar: '', asign: '' }
            const token = jwt.sign(
              filterUserInfo,
              PRIVATE_KEY,
              { expiresIn: EXPIRESIN },
              { algorithm: 'RS256' }
            )
            ctx.body = {
              status: '200',
              token: token,
              data: { ...res, password: '' },
              message: '登录成功,欢迎回来！',
            }
          })
        }
      })
    }
  })
}
// 创建用户收货地址
const createAdress = async ctx => {
  const { addressInfo } = ctx.request.body
  const { cityName, countyName, detailInfo, provinceName, telNumber, realName } = addressInfo
  const user = ctx.user
  const id = snid.generate()
  const find = "SELECT count(*) count FROM user_address WHERE user_id = ?"
  let sql = "INSERT INTO user_address (id,user_id,cityName, countyName, detailInfo, provinceName, telNumber, realName) VALUES (?,?,?,?,?,?,?,?)"
  await query(find, [user.id]).then(async res => {
    if (res[0].count > 0) {
      sql = "UPDATE user_address SET cityName=?, countyName=?, detailInfo=?, provinceName=?, telNumber=?, realName=? WHERE user_id = ?"
      await query(sql, [cityName, countyName, detailInfo, provinceName, telNumber, realName, user.id]).then((res => {
        ctx.body = {
          status: 200,
          message: "已更新"
        }
      })).catch(err => {
        ctx.body = {
          status: 500,
          message: err
        }
      })
    }else {
      await query(sql, [id, user.id, cityName, countyName, detailInfo, provinceName, telNumber, realName]).then(res => {
        ctx.body = {
          status: 200,
          message: "新增成功"
        }
      }).catch(err => {
        ctx.body = {
          status: 500,
          message: err
        }
      })
    }
  })
}


// 获取用户收货地址
const getUserAddress = async ctx => {
  const { id } = ctx.user
  const sql = "SELECT * FROM user_address WHERE user_id = ?"
  await query(sql, [id]).then(res => {
    ctx.body = {
      status: 200,
      message: 'ok',
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
  getAllUser,
  getUserInfoById,
  userRegister,
  userLogin,
  updateUserInfo,
  deleteUser,
  updateUserAvatar,
  getSingeAvatar,
  wxLogin,
  createAdress,
  getUserAddress
}
