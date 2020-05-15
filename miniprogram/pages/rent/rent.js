// miniprogram/pages/rent/rent.js

var app = getApp();
var db = wx.cloud.database();
var common = require("../../common.js");
var _ = db.command;

Page({

    /**
     * 页面的初始数据
     */
    data: {
        list: [],
        page:0,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getList();
    },

    //获取出租书籍列表
    getList() {
        var that = this;
        
        db.collection('publish').where({
          status: 0,
          //collegeid: collegeid,
          chooseId:1,
        }).orderBy('creatTime', 'desc').limit(20).get({
          success: function (res) {
            wx.stopPullDownRefresh(); //暂停刷新动作
            console.log(res)
            if (res.data.length == 0) {
              that.setData({
                nomore: true,
                list: [],
              })
              return false;
            }
            if (res.data.length < 20) {
              that.setData({
                nomore: true,
                page: 0,
                list: res.data,
              });
              
              
              
            } else {
              that.setData({
                page: 0,
                list: res.data,
                nomore: false,
              });
              
            }
          }
        })
      },

      more() {
        var that = this;
        if (that.data.nomore || that.data.list.length < 20) {
          return false
        }
        var page = that.data.page + 1;
        
        db.collection('publish').where({
          status: 0,
          chooseId:1
          //collegeid: collegeid
        }).orderBy('creatTime', 'desc').skip(page * 20).limit(20).get({
          success: function (res) {
            if (res.data.length == 0) {
              that.setData({
                nomore: true
              })
              return false;
            }
            if (res.data.length < 20) {
              that.setData({
                nomore: true
              })
            }
            that.setData({
              page: page,
              list: that.data.list.concat(res.data)
            })
          },
          fail() {
            wx.showToast({
              title: '获取失败',
              icon: 'none'
            })
          }
        })
      },
    
      //获取更多书籍
      onReachBottom() {
        this.more();
      },
    
      
    
      //下拉刷新
      onPullDownRefresh() {
        this.getList();
      },
    
      //监测屏幕滚动
      onPageScroll: function (e) {
        this.setData({
          scrollTop: parseInt((e.scrollTop) * wx.getSystemInfoSync().pixelRatio)
        })
      },
    
      //回到顶部
      goTop() {
        wx.pageScrollTo({
          scrollTop: 0
        })
      },
    
      //到书籍详情页
      detail(e) {
        wx.navigateTo({
          url: '/pages/detail/detail?scene=' + e.currentTarget.dataset.id,
        })
      },
      
    
})