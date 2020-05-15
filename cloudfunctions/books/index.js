
//此处填写在极速书籍那边申请的接口密钥
var appkey = 'xxxxxxxxxxxx';

// 云函数入口文件
var cloud = require('wx-server-sdk');
cloud.init();
var TcbRouter = require('tcb-router');
var request = require('request');


// 云函数入口函数
exports.main = async (event, context) => {
  var app = new TcbRouter({
    event
  });

  //根据isbn码获取极速API图书详情信息
  app.router('bookinfo', async (ctx) => {
    ctx.body = new Promise(resolve => {
      request({
        url: 'https://api.jisuapi.com/isbn/query?appkey=' + appkey + '&isbn=' + event.isbn,
        method: "GET",
        json: true,
      }, function (error, response, body) {
        resolve({
          body: body
        })
      });
    });
  });
  return app.serve();
}
