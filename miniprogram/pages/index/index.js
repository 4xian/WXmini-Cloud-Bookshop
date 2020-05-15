//index.js
var app = getApp();
var db = wx.cloud.database();
var common = require("../../common.js");
var _ = db.command;

Page({
  data: {
    college: JSON.parse(common.data).college,
    collegeCur: -2,
    showList: false,
    scrollTop: 0,
    nomore: false,
    list: [],
    iscard: false

  },

  onLoad() {
    //this.listkind();
    this.getList();
  },

  // //获取上次布局记忆
  // listkind() {
  //   var that = this;
  //   wx.getStorage({
  //     key: 'iscard',
  //     success: function (res) {
  //       that.setData({
  //         iscard: res.data
  //       })
  //     },
  //     fail() {
  //       that.setData({
  //         iscard: true,
  //       })
  //     }
  //   })
  // },
  // //布局方式选择
  // changeCard() {
  //   var that = this;
  //   if (that.data.iscard) {
  //     that.setData({
  //       iscard: false
  //     })
  //     wx.setStorage({
  //       key: 'iscard',
  //       data: ture,
  //     })
  //   } else {
  //     that.setData({
  //       iscard: true
  //     })
  //     wx.setStorage({
  //       key: 'iscard',
  //       data: true,
  //     })
  //   }
  // },

  //跳转搜索
  search() {
    wx.navigateTo({
      url: '/pages/search/search',
    })
  },

  //学院选择
  collegeSelect(e) {
    this.setData({
      collegeCur: e.currentTarget.dataset.id - 1,
      scrollLeft: (e.currentTarget.dataset.id - 3) * 100,
      showList: false,
    })
    this.getList();
  },

  //选择全部
  selectAll() {
    this.setData({
      collegeCur: -2,
      scrollLeft: -200,
      showList: false,
    })
    this.getList();
  },

  //展示列表小面板
  showlist() {
    var that = this;
    if (that.data.showList) {
      that.setData({
        showList: false,
      })
    } else {
      that.setData({
        showList: true,
      })
    }
  },

  getList() {
    var that = this;
    if (that.data.collegeCur == -2) {
      var collegeid = _.neq(-2); //除-2之外所有
    } else {
      var collegeid = that.data.collegeCur + '' //小程序搜索必须对应格式
    }
    db.collection('publish').where({
      status: 0,
      //deadline: _.gt(new Date().getTime()),
      collegeid: collegeid,
      chooseId: 0,
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
    if (that.data.collegeCur == -2) {
      var collegeid = _.neq(-2); //除-2之外所有
    } else {
      var collegeid = that.data.collegeCur + '' //小程序搜索必须对应格式
    }
    db.collection('publish').where({
      status: 0,
      //deadline: _.gt(new Date().getTime()),
      collegeid: collegeid
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

  goRent() {
    wx.navigateTo({
      url: '../rent/rent',
    })
  },

  goReview() {
    wx.navigateTo({
      url: '../review/review',
    })
  },

})