require('module-alias/register') // 配置别名

const Koa = require('koa')
const bodyparser = require('koa-bodyparser')
const cors = require('koa2-cors')

const Router = require('@router/index')

const app = new Koa()


// 中间件
app.use(cors({ origin: '*' }))
app.use(bodyparser({
    enableTypes: ['json', 'form', 'text']
}))


// 路由
const RouterArray = Object.values(Router);
// 遍历注册路由
RouterArray.forEach((RouteItem) => {
    app.use(RouteItem.routes());
    app.use(RouteItem.allowedMethods());// 不支持的请求
});


app.listen(10008, () => {
    console.log('Server Live Run http://localhost:10008');
})


