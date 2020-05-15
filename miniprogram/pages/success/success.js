var app = getApp()
var db = wx.cloud.database();
var common = require("../../common.js");
var _ = db.command;
Page({

      /**
       * 页面的初始数据
       */
      data: {

      },

      /**
       * 生命周期函数--监听页面加载
       */
      onLoad: function (e) {
            this.getdetail(e.id);
      },
      //回到首页
      home() {
            wx.switchTab({
                  url: '/pages/index/index',
            })
      },
      //获取订单详情
      getdetail(_id) {
            var that = this;
            db.collection('order').doc(_id).get({
                  success(e) {
                      that.setData({
                            creatTime: common.formTime(e.data.creatTime),
                            detail:e.data
                      })
                  },
                  fail(){
                        wx.showToast({
                              title: '获取失败，请稍后到订单中心内查看',
                        })
                  }
            })
      },
      godetail(){
            wx.redirectTo({
                  url: '/pages/order/myOrder/myOrder',
            })
      }
})