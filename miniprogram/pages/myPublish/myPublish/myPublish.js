// miniprogram/pages/cart/myPublish/myPublish.js
var app = getApp()
var db = wx.cloud.database();
var common = require("../../../common.js");
var _ = db.command;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    page: 1,
    scrollTop: 0,
    nomore: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getList();
  },

  //获取发布订单信息
  getList() {
    var that = this;
    db.collection('publish').where({
      _openid: app.globalData.openid
    }).orderBy('creatTime', 'desc').limit(20).get({
      success: function (res) {
        wx.hideLoading();
        wx.stopPullDownRefresh(); //暂停刷新动作
        that.setData({
          list: res.data,
          nomore: false,
          page: 0,
        })
        //console.log(res.data)
      }
    })
  },
  //删除
  del(e) {
    var that = this;
    var del = e.currentTarget.dataset.del;
    wx.showModal({
      title: '温馨提示',
      content: '您确定要删除此条订单吗？',
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '正在删除...'
          })
          db.collection('publish').doc(del._id).remove({
            success() {
              wx.hideLoading();
              wx.showToast({
                title: '删除成功!',
              })
              that.getList();
            },
            fail() {
              wx.hideLoading();
              wx.showToast({
                title: '删除失败！重试',
              })
            }
          })
        }
      }
    })
  },

  //擦亮 延长发布时间
  crash(e) {
    let that = this;
    let crash = e.currentTarget.dataset.crash;
    wx.showModal({
      title: '温馨提示',
      content: '您确定要延长发布时间吗？',
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '正在延长...'
          })
          db.collection('publish').doc(crash._id).update({
            data: {
              creat: new Date().getTime(),
              dura: new Date().getTime() + 10 * (24 * 60 * 60 * 1000), //每次擦亮管7天
            },
            success() {
              wx.hideLoading();
              wx.showToast({
                title: '成功延迟10天！',
              })
              that.getList();
            },
            fail() {
              wx.hideLoading();
              wx.showToast({
                title: '操作失败！重试',
              })
            }
          })
        }
      }
    })
  },

  //查看商品详情
  detail(e) {
    var that = this;
    //e.currentTarget.dataset.id
    var detail = e.currentTarget.dataset.detail;
    //在售中
    if (detail.status == 0) {
      wx.navigateTo({
        url: '/pages/detail/detail?scene=' + detail._id,
      })
    }
    //其他情况
    if (detail.status == 1 ||detail.status ==4) {
      wx.navigateTo({
        url: '/pages/myPublish/detail/detail?id=' + detail._id,
      })
    }
    
  },

  //下拉刷新
  onPullDownRefresh() {
    this.getList();
},


})