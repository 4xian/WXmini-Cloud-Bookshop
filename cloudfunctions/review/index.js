// 云函数入口文件
var cloud = require('wx-server-sdk')
cloud.init()
var db = cloud.database();
console.log('开始调用云函数上传书籍信息！')
function add(event, context) {
  return new Promise(function (resolve, reject) {
    db.collection('review').add({
      data: {
        bookinfo: event.bookinfo,
        review: event.review,
        creatTime: Date.now(),
        //openId: event.userInfo.openId,

      },
      success(res) {
        resolve(res);
        console.log(res);

      },
      fail(err) {
        reject(err);
      }

    });
  })
}

function getData(event,context){
  return db.collection('review').orderBy('creatTime', 'desc').get();
}

// 云函数入口函数
exports.main = async (event, context) => {
    console.log('调用云函数成功！');
    console.log(event);
  
    if(event.type === 'add'){
      return add(event,context);
    }else{
      return getData(event,context);
    }
}