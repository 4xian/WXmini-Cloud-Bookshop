var common = require("common.js");

//app.js
App({
  openid: '',
  userInfo: '',
  canReflect: true,
  // openid: "oSpUp41erVTl0eU7eCDAl_WayUIg",
  // userInfo:{
  //   "_id":"f8c2cf1e5e97c46f0028dcec24f10210",
  //   "_openid":"oSpUp41erVTl0eU7eCDAl_WayUIg",
  //   "campus":{
  //   "id":0,
  //   "name":"安徽农业大学"
  //   },
  //   "email":"1145024061@qq.com",
  //   "info":{
  //   "avatarUrl":"https://wx.qlogo.cn/mmopen/vi_32/KoXA6326rLy7FeykVC2wKISCo1iaJoSIFjlFJYqkdpibH0CZAmHqMHv6O5WR8M6V8qJOjrlWGTl7t6ah0EiaYY7gA/132",
  //   "city":"",
  //   "country":"France",
  //   "gender":1,
  //   "language":"zh_CN",
  //   "nickName":"我不是诗仙。",
  //   "province":"Lyon"
  //   },
  //   "parse":0,
  //   "phone":"17354004300",
  //   "qqnum":"",
  //   "stamp":1587004526659,
  //   "useful":true,
  //   "wxnum":""
  //   },
  

  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({

        traceUser: true,
      })
    }
    this.systeminfo = wx.getSystemInfoSync();


     this.globalData = {
       userInfo: '',
       openid: '',

       usernum:'',
       mensum:'',
       ordersum:'',
       onordersum:'',
       inordersum:'',
       doneordersum:'',
       canclordersum:'',

     }

    var that = this
    wx.getStorage({
      key: 'userInfo',
      success(res) { 
         that.globalData.userInfo = res.data
         console.log(that.globalData.userInfo)
      }
    });
    wx.getStorage({
      key: 'openid',
      success(res){
        that.globalData.openid = res.data
        console.log(that.globalData.openid)
      }
    })
  },
  // onShow() {
    
  // },
})