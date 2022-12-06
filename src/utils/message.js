const Core = require('@alicloud/pop-core');

const { AccessKeyID, AccessKeySecret } = require('@config/const')

var client = new Core({
    accessKeyId: AccessKeyID,
    accessKeySecret: AccessKeySecret,
    // securityToken: '<your-sts-token>', // use STS Token
    endpoint: 'https://dysmsapi.aliyuncs.com',
    apiVersion: '2017-05-25'
});

var requestOption = {
    method: 'POST',
    formatParams: false,

};

const postMessage = (phone = 18483128820) => {
    const params = {
        "SignName": "阿里云短信测试",
        "TemplateCode": "SMS_154950909",
        "PhoneNumbers": `${phone}`,
        "TemplateParam": "{\"code\":\"1234\"}",
        "SourceIp": "118.113.212.240"
    }
    return new Promise((resolve, reject) => {
        client.request('SendSms', params, requestOption).then(res => {
            const result = JSON.stringify(res)
            resolve(result)
        }).catch(err => {
            reject(err)
        })
    })
}

module.exports = postMessage