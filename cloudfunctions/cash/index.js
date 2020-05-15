var config = {
      appid: 'wx2cc7e47c681d1101', //小程序Appid
      envName: 'shixian-jx2100', // 小程序云开发环境ID
      mchid: '1587479591', //商户号
      partnerKey: 'jianzhimin1735400430018755294439', //此处填服务商密钥
      pfx: '', //证书初始化
      fileID: 'cloud://shixian-jx2100.7368-shixian-jx2100-1301578378/apiclient_cert.p12', //证书云存储id
      actionName: '安农大闲置书籍小程序提现',
      rate: 1 //提现收取利率，1指的是每笔收取1%
};

/*
下
面
不
用
管
*/
var cloud = require('wx-server-sdk')
cloud.init({
      env: config.envName
})

var db = cloud.database();
var tenpay = require('tenpay'); //支付核心模块
exports.main = async (event, context) => {

      var userInfo = (await db.collection('user').doc(event.userid).get()).data;
      //     if (userInfo.parse <= Number(event.num)){
      //           return 0;
      //     }
      //首先获取证书文件
      var fileres = await cloud.downloadFile({
            fileID: config.fileID,
      })
      config.pfx = fileres.fileContent
      var pay = new tenpay(config, true)
      var result = await pay.transfers({
            partner_trade_no: 'bookcash' + Date.now() + Number(event.num),
            openid: userInfo._openid,
            check_name: 'NO_CHECK',
            amount: Number(event.num) - 1,
            desc: config.actionName,
      });
      console.log(result);
      if (result.result_code == 'SUCCESS') {
            //成功后操作
            //以下是进行余额计算
            try {
                  return await db.collection('user').doc(event.userid).update({
                        data: {
                              parse: userInfo.parse - Number(event.num)
                        }
                  })
            } catch (e) {
                  console.log(e)
            }
            // var res = await db.collection('user').doc(event.userid).update({
            //       data: {
            //             parse: Number(userInfo.parse) - Number(event.num)
            //       }
            // });
            // console.log(res);
            // return res
      }
}