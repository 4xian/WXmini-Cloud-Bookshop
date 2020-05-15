// miniprogram/pages/order/myOrder/myOrder.js
var app = getApp()
var db = wx.cloud.database();
var common = require("../../../common.js");
var _ = db.command;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    scrollTop: 0,
    nomore: false,
    tab: [{
        name: '全部',
        id: 0,
      },
      {
        name: '交易中',
        id: 1,
      },
      {
        name: '交易完成',
        id: 2,
      },
      {
        name: '已取消',
        id: 3,
      }
    ],
    tabid: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getlist();
  },


  //获取订单列表
  getlist() {
    var that = this;
    var status = that.data.tabid;
    if (status == 0) {
      var statusid = _.neq(0); //除-2之外所有
    } else {
      var statusid = parseInt(status) //小程序搜索必须对应格式
    }
    db.collection('order').where({
      status: statusid,
      _openid: app.globalData.openid
    }).orderBy('creatTime', 'desc').get({
      success(res) {
        wx.stopPullDownRefresh(); //暂停刷新动作
        that.setData({
          nomore: false,
          page: 0,
          list: res.data
        })
        wx.hideLoading();
      }
    })
  },
  //导航栏切换
  changeTab(e) {
    var that = this;
    that.setData({
      tabid: e.currentTarget.dataset.id
    })
    that.getlist();
  },

  //跳转详情页
  godetail(e) {
    wx.navigateTo({
      url: '/pages/order/detail/detail?id=' + e.currentTarget.dataset.id,
    })
  },




})