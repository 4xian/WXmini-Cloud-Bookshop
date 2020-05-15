// 云函数入口文件
var cloud = require('wx-server-sdk')
var QcloudSms = require("qcloudsms_js")
// 替换成您申请的云短信 AppID 以及 AppKey
var sdkappid = '14xxxxxxxx'
var appkey = "xxxxxxxxxxxxxxxxxxxxx"
var buyId = 58xxxx // 申请模板 ID 下单时提醒卖家
var deliveryId = 58xxxx //  发货时提醒买家
var remindId =58xxxx//提醒买家收货
var cancelId = 58xxxx//取消交易提醒
var finishId = 58xxxx //  已经收货后提醒卖家
var smsSign = "安农大闲置书店" // 替换成您所申请的签名

/*
下
面
不
用
管
*/

cloud.init()
var db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => new Promise((resolve, reject) => {
  /*单发短信示例为完整示例，更多功能请直接替换以下代码*/
  var qcloudsms = QcloudSms(sdkappid, appkey);
  var ssender = qcloudsms.SmsSingleSender();
  var params = [];
  // 获取发送短信的手机号码
  var mobile = event.mobile
  // 获取手机号国家/地区码
  var nationcode = '86';

  //下单时提醒卖家
  if (event.type == 1) {
    ssender.sendWithParam(nationcode, mobile, buyId, params, smsSign, "", "", (err, res, resData) => {
      /*设置请求回调处理, 这里只是演示，您需要自定义相应处理逻辑*/
      if (err) {
        console.log("err: ", err);
        reject({
          err
        })
      } else {
        resolve({
          res: res.req,
          resData
        })
      }
    });
  }
  //发货时提醒买家
  if (event.type == 2) {
    ssender.sendWithParam(nationcode, mobile, deliveryId, params, smsSign, "", "", (err, res, resData) => {
      /*设置请求回调处理, 这里只是演示，您需要自定义相应处理逻辑*/
      if (err) {
        console.log("err: ", err);
        reject({
          err
        })
      } else {
        resolve({
          res: res.req,
          resData
        })
      }
    });
  }
  //提醒买家收货
  if (event.type == 3) {
    ssender.sendWithParam(nationcode, mobile, remindId, params, smsSign, "", "", (err, res, resData) => {
      /*设置请求回调处理, 这里只是演示，您需要自定义相应处理逻辑*/
      if (err) {
        console.log("err: ", err);
        reject({
          err
        })
      } else {
        resolve({
          res: res.req,
          resData
        })
      }
    });
  }
  //收货后提醒卖家
  if (event.type == 4) {
    ssender.sendWithParam(nationcode, mobile, finishId, params, smsSign, "", "", (err, res, resData) => {
      /*设置请求回调处理, 这里只是演示，您需要自定义相应处理逻辑*/
      if (err) {
        console.log("err: ", err);
        reject({
          err
        })
      } else {
        resolve({
          res: res.req,
          resData
        })
      }
    });
  }
  //取消交易后提醒卖家
  if (event.type == 5) {
    ssender.sendWithParam(nationcode, mobile, cancelId, params, smsSign, "", "", (err, res, resData) => {
      /*设置请求回调处理, 这里只是演示，您需要自定义相应处理逻辑*/
      if (err) {
        console.log("err: ", err);
        reject({
          err
        })
      } else {
        resolve({
          res: res.req,
          resData
        })
      }
    });
  }

})
