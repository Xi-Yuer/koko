const isCorrectPassword = (str) => {
    const reg = /^(\w){6,18}$/
    return reg.test(str)
}

module.exports = isCorrectPassword