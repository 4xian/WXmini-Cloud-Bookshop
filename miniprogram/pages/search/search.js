// miniprogram/pages/search/search.js

var app = getApp()
var db = wx.cloud.database();
var common = require("../../common.js");
var _ = db.command;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    scrollTop: 0,
    newlist: [],
    list: [],
    key: '',
    blank: false,
    hislist: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getHistory();
    this.getNew();
  },

  //获取本地搜索记录
  getHistory() {
    var that = this;
    wx.getStorage({
      key: 'History',
      success: function (res) {
        var hislist = JSON.parse(res.data);
        //限制长度
        if (hislist.length > 4) {
          hislist.length = 4
        }
        that.setData({
          hislist: hislist
        })
      },
    })
  },

  //选择历史搜索关键词
  choosekey(e) {
    this.data.key = e.currentTarget.dataset.key;
    this.search('his');
  },

  //最新推荐书籍
  getNew() {
    var that = this;
    wx.getStorage({
      key: 'keyHistory',
      success(res) {
        console.log(res.data)
        var key = res.data;
        db.collection('publish').where({
          status: 0,
          //deadline: _.gt(new Date().getTime()),
          key: db.RegExp({
            regexp: '.*' + key + '.*',
            options: 'i',
          })
        }).orderBy('creatTime', 'desc').get({
          success: function (res) {
            var newlist = res.data;
            //限定5个推荐内容
            if (newlist.length > 5) {
              newlist.length = 5;
            }
            that.setData({
              newlist: newlist,
            });

          }
        })
      }
    })




  },

  //跳转详情
  detail(e) {
    var that = this;
    wx.navigateTo({
      url: '/pages/detail/detail?scene=' + e.currentTarget.dataset.id,
    })
  },

  //搜索结果
  search(n) {
    var that = this;
    var key = that.data.key;
    if (key == '') {
      wx.showToast({
        title: '请输入关键词',
      })
      return false;
    }
    wx.setNavigationBarTitle({
      title: '"' + that.data.key + '" 的搜索结果',
    })
    wx.showLoading({
      title: '搜索中...',
    })
    if (n !== 'his') {
      that.history(key);
    }
    db.collection('publish').where({
      status: 0,
      //deadline: _.gt(new Date().getTime()),
      key: db.RegExp({
        regexp: '.*' + key + '.*',
        options: 'i',
      })
    }).orderBy('creatTime', 'desc').limit(20).get({
      success(e) {
        wx.hideLoading();
        that.setData({
          blank: true,
          page: 0,
          list: e.data,
          nomore: false,
        })
        wx.setStorage({
          data: key,
          key: 'keyHistory',
        })
      }
    })
  },

  //添加到搜索历史
  history(key) {
    var that = this;
    wx.getStorage({
      key: 'History',
      success(res) {
        var oldarr = JSON.parse(res.data); //字符串转数组
        var newa = [key]; //对象转为数组
        var newarr = JSON.stringify(newa.concat(oldarr)); //连接数组\转字符串
        wx.setStorage({
          key: 'History',
          data: newarr,
        })
      },
      fail(res) {
        //第一次打开时获取为null
        var newa = [key]; //对象转为数组
        var newarr = JSON.stringify(newa); //数组转字符串
        wx.setStorage({
          key: 'History',
          data: newarr,
        })
      }
    });
  },
  keyInput(e) {
    this.data.key = e.detail.value
  },

})