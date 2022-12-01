const mysql = require('mysql2');
let config = {
    host: '112.124.28.77',
    user: 'root',
    password: '2214380963Wx',
    database: 'koko',
    port: 3306,
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