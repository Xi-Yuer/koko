var axios = require('axios');
var FormData = require('form-data');
var data = new FormData();
data.append('product_id', '123');
data.append('realname', '张三');
data.append('mobile', '18483128820');
data.append('address', '收货地址');
data.append('amount', '2');
data.append('total_price', '100');
data.append('order_status', '0');

var config = {
   method: 'post',
   url: 'http://localhost:10008/order/create',
   headers: { 
      'User-Agent': 'Apifox/1.0.0 (https://www.apifox.cn)', 
      ...data.getHeaders()
   },
   data : data
};

axios(config)
.then(function (response) {
   console.log(JSON.stringify(response.data));
})
.catch(function (error) {
   console.log(error);
});