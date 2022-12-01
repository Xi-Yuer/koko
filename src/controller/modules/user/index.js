const md5 = require('md5');
const jwt = require("jsonwebtoken")

const { privateKey, expiresIn } = require('@config/jwt')
const { query } = require("@db/index")
const snid = require('@utils/snowflake')
const isPhoneNumber = require('@utils/isPhoneNumber')
const isCorrectPassword = require('@utils/isCorrectPassword')

const getAllUser = async ctx => {
    const sql = "SELECT * FROM users"
    await query(sql).then(res => {
        ctx.body = res
    })
}

const userRegister = async (ctx, next) => {
    // 生成一个随机名字充当默认值
    const radomName = Math.random().toString(36).slice(-8);
    const { phone, password, name = radomName, gender = 0 } = ctx.request.body
    if (!phone || !password) {
        ctx.body = {
            status: 0,
            message: "手机号或密码不能为空"
        }
    } else {
        const isPhoneNumberFlag = isPhoneNumber(phone)
        if (!isPhoneNumberFlag) {
            ctx.body = {
                status: 400,
                message: "手机号格式错误"
            }
            return
        }
        const passwordIsCorrect = isCorrectPassword(password)
        if (!passwordIsCorrect) {
            ctx.body = {
                status: 401,
                message: "密码只能是数字和字母的6-18位组合"
            }
            return
        }
        const findSql = "SELECT * FROM users WHERE phone_number = ?"
        await query(findSql, [phone]).then(async res => {
            if (res.length) {
                ctx.body = {
                    status: 401,
                    message: "手机号已存在"
                }
            } else {
                const sql = "INSERT INTO users (id, phone_number, password, name, gender) VALUES (?,?,?,?,?)"
                // 生成唯一id
                const id = snid.generate()
                await query(sql, [id, phone, md5(password), name, gender]).then(res => {
                    if (res.affectedRows) {
                        ctx.body = {
                            status: 200,
                            message: "注册成功"
                        }
                    }
                })
            }
        })
    }
}

const userLogin = async (ctx, next) => {
    const { phone, password } = ctx.request.body
    if (!phone || !password) {
        ctx.body = {
            status: 0,
            message: "用户或密码不能为空"
        }
    } else {
        const sql = "select * from users where phone_number = ?"
        await query(sql, phone).then(([res]) => {
            if (res && res.password == md5(password)) {
                // 将用户敏感数据和不必要的数据去除掉生成 token
                const filterUserInfo = { ...res, password: "", avatar: "", asign: "" }
                const token = jwt.sign(filterUserInfo, privateKey, { expiresIn: expiresIn }, { algorithm: 'RS256' })
                ctx.body = {
                    status: 200,
                    token: token,
                    message: "登录成功"
                }
            } else {
                ctx.body = {
                    status: 401,
                    message: "手机号或密码错误"
                }
            }
        })
    }
}

const updateUserInfo = async (ctx) => {
    const qureyUserInfo = ctx.request.body

    // 先根据用户id查询出来用户原始信息
    if (!qureyUserInfo.id) {
        ctx.body = {
            status: 401,
            message: "用户id不能为空"
        }
        return
    } else {
        const find = "SELECT * FROM users WHERE id = ?"
        await query(find, [qureyUserInfo.id]).then(async res => {
            if (res.length > 0) {

                let sql = "UPDATE users SET "

                Object.keys(qureyUserInfo).forEach(key => {
                    if (key === "password") {
                        sql += ` ${key} = "${md5(qureyUserInfo[key])}",`
                    } else {
                        if (qureyUserInfo[key]) {
                            sql += ` ${key} = "${qureyUserInfo[key]}",`
                        }
                    }
                })

                sql = sql.substr(0, sql.length - 1) + " WHERE id = ?"

                await query(sql, [qureyUserInfo.id]).then(res => {
                    if (res.affectedRows) {
                        ctx.body = {
                            status: 200,
                            message: "修改成功"
                        }
                        return
                    }
                })

            } else {
                ctx.body = {
                    status: 404,
                    message: "用户不存在"
                }
            }
        })
    }
}

const deleteUser = async (ctx) => {
    const { id } = ctx.request.query

    const find = "SELECT COUNT(*) AS count FROM users WHERE id = ?"

    await query(find, [id]).then(async ([res]) => {
        if (res.count > 0) {
            // 用户存在，可以删除用户
            const sql = "DELETE FROM users WHERE id = ?"
            return await query(sql, [id]).then(({ affectedRows }) => {
                if (affectedRows >= 1) {
                    ctx.body = {
                        status: 200,
                        message: "删除用户成功"
                    }
                } else {
                    ctx.body = {
                        status: 500,
                        message: "删除用户失败"
                    }
                }
            })
        } else {
            ctx.body = {
                status: 404,
                message: "用户不存在"
            }
        }
    })

}

module.exports = {
    getAllUser,
    userRegister,
    userLogin,
    updateUserInfo,
    deleteUser
}