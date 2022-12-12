/**判断是否是手机号**/
function isPhoneNumber(tel) {
    var reg =/^1[3456789]\d{9}$/;
    return reg.test(tel);
}
module.exports = isPhoneNumber