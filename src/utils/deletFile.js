const fs = require("fs")
const deletFile = filePath => {
    fs.unlink(filePath, (err) => {
        if (err) {
            return false
        } else {
            return true
        }
    })
}

module.exports = deletFile
