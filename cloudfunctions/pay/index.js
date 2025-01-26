var config = {
  appid: 'wx2xxxxxxxxxx', //服务商公众号Appid
  envName: 'shixian', // 小程序云开发环境ID
  mchid: '158xxxxxxx', //商户号
  partnerKey: 'xxxxxxxxxxxxxxxxxxxx', //此处填服务商密钥32位
  notify_url: 'https://mp.weixin.qq.com', //这个不要管
  spbill_create_ip: '127.0.0.1' //这个不要管
};

/*
下
面
不
用
管
*/

var cloud = require('wx-server-sdk');
cloud.init({
  env: config.envName
})
var db = cloud.database();
var TcbRouter = require('tcb-router'); //云函数路由
var rq = require('request');
var tenpay = require('tenpay'); //支付核心模块

exports.main = async (event, context) => {
  var app = new TcbRouter({
    event
  });
  //支付回调
  app.router('pay', async (ctx) => {
    var wxContext = cloud.getWXContext();
    // 在云函数参数中，提取商品 ID
    var goodId = event.goodId;
    // 根据商品的数据库_id将其它数据提取出来
    var goods = await db.collection('publish').doc(goodId).get();
    // 在云函数中提取数据，包括名称、价格才更合理安全，
    // 因为从端里传过来的商品数据都是不可靠的
    var good = goods.data;
    if(good.chooseId ==0){
      var price = Number(good.sellPrice)
    }else{
      var price = Number(good.bookinfo.price)
    }
    var curTime = Date.now();
    var api = tenpay.init(config)
    var result = await api.getPayParams({
      //商户订单号，我这里是定义的boolk+商品发布时间+当前时间戳
      //微信这里限制订单号一次性不能重复，只需要唯一即可
      out_trade_no: 'book' + good.creatTime + '' + curTime,
      body: good.bookinfo.title, //商品名称，我设置的书名
      total_fee: price * 100, //金额，注意是数字，不是字符串
      openid: wxContext.OPENID //***用户的openid
    });
    ctx.body = result; //返回前端结果
  });
  //充值钱包
  app.router('recharge', async (ctx) => {
    var wxContext = cloud.getWXContext();
    var curTime = Date.now();
    var api = tenpay.init(config)
    var result = await api.getPayParams({
      //商户订单号
      out_trade_no: 'bookcz' + '' + curTime,
      body: '充值钱包', //商品名称
      total_fee: event.num * 100, //金额，注意是数字，不是字符串
      openid: wxContext.OPENID //***用户的openid
    });
    ctx.body = result; //返回前端结果
  });

  //修改卖家书籍在售状态
  app.router('changeP', async (ctx) => {
    try {
      return await db.collection('publish').doc(event._id).update({
        data: {
          status: event.status
        }
      })
    } catch (e) {
      console.error(e)
    }
  });

  //修改订单状态
  app.router('changeO', async (ctx) => {
    console.log("1")
    try {
      return await db.collection('order').doc(event._id).update({
        data: {
          status: event.status
        }
      })
    } catch (e) {
      console.error(e)
    }
  });
  return app.serve();
}
