const mysql = require('mysql2');
const { MYSQL_HOST, MYSQL_PORT, MYSQL_PASSWORD, MYSQL_ROOT, MYSQL_DATABASE } = require("@config/const")
let config = {
    host: MYSQL_HOST,
    user: MYSQL_ROOT,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE,
    port: MYSQL_PORT,
    multipleStatements: true//允许多条sql同时执行
};
let pool = mysql.createPool(config);

let query = (sql, values) => {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                reject(err)
            } else {
                connection.query(sql, values, (err, rows) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(rows)
                    }
                    connection.release()
                })
            }
        })
    })
};
module.exports = {
    query
}