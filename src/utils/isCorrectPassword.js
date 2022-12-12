const isCorrectPassword = (str) => {
    const reg = /^(\w){5,19}$/
    return reg.test(str)
}

module.exports = isCorrectPassword