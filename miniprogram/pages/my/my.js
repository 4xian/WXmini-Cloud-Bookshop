// miniprogram/pages/my/my.js
var app = getApp();
var common = require("../../common.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    //showShare: false,
    poster: JSON.parse(common.data).share_poster,

  },
  
onShow(){
  this.setData({
    userInfo:app.globalData.userInfo
  })
  console.log(this.data.userInfo)
},
   
  


  //判断是否需要注册
  go(e) {
    if (e.currentTarget.dataset.status == '1') {
      if (!app.globalData.openid) {
        wx.showModal({
          title: '温馨提示',
          content: '该功能需要注册方可使用，是否马上去注册',
          success(res) {
            if (res.confirm) {
              wx.navigateTo({
                url: '/pages/login/login',
              })
            }
          }
        })
        return false
      }
    }
    wx.navigateTo({
      url: e.currentTarget.dataset.go
    })
  },
  //展示分享弹窗
  showShare() {
    this.setData({
      showShare: true,
    })

  },

  //关闭分享弹窗
  closeShare() {
    this.setData({
      showShare: false,
    })
  },

  //退出登录
  outLogin(){
    
      app.globalData.userInfo = '';
      app.globalData.openid = '';
      this.setData({
        userInfo:''
      })
      wx.clearStorage({

      })
    console.log(this.data.userInfo)
    
  },

  //进入管理员登录界面
  adminLogin(){
    wx.navigateTo({
      url: '/pages/admin/admin',
    })
  }


})