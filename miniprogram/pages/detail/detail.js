// miniprogram/pages/detail/detail.js

var app = getApp()
var db = wx.cloud.database();
var common = require("../../common.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    cart: [],
    first_title: true,
    showRentBuy: false,
    showBuy: false,
    bookinfo: '',
    selluserinfo: '',
    buyuserinfo: '',
    delivery: [{
      name: '校内面交',
      id: 0,
      check: false,
    }, {
      name: '快递',
      id: 1,
      check: false
    }],
    chooseDelivery: 0,
    sameCampus: '',
    buywx: '', //面交时留的wx

    buylog: { //快递信息
      buyName: '',
      buyPhone: '',
      buyPlace: '',
      buyOther: ''
    }
  },

  onLoad(e) {
    this.getuserdetail();
    this.setData({
      id: e.scene,
      buyuserinfo: app.globalData.userInfo
    })
    this.getPublish(e.scene);
  },

  //下拉刷新时
  onPullDownRefresh(e) {
    this.getuserdetail();
    this.getPublish(this.data.id);
    wx.stopPullDownRefresh({
      complete: (res) => {},
    })
  },
  changeTitle(e) {
    var that = this;
    that.setData({
      first_title: e.currentTarget.dataset.id
    })
  },
  //获取发布信息
  getPublish(e) {
    var that = this;
    db.collection('publish').doc(e).get({
      success: function (res) {
        that.setData({
          collegeName: JSON.parse(common.data).college[parseInt(res.data.collegeid) + 1],
          publishinfo: res.data
        })
        that.getSeller(res.data._openid, res.data.bookinfo._id)
      }
    })
  },

  //获取卖家信息
  getSeller(m, n) {
    var that = this;
    db.collection('user').where({
      _openid: m
    }).get({
      success: function (res) {
        that.setData({
          selluserinfo: res.data[0]
        })
        that.getBook(n)
      }
    })
  },

  //获取书籍详情
  getBook(e) {
    var that = this;
    db.collection('books').doc(e).get({
      success: function (res) {
        that.setData({
          bookinfo: res.data
        })
      }
    })
  },

  //回到首页
  home() {
    wx.switchTab({
      url: '/pages/index/index',
    })
  },

  //加入购物车
  addCart(e) {
    var that = this;
    if (!app.globalData.openid) {
      wx.showModal({
        title: '温馨提示',
        content: '该功能需要注册才能使用，是否注册？',
        success(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login',
            })
          }
        }
      })
      return false
    } else if (that.data.selluserinfo._openid == app.globalData.openid) {
      wx.showToast({
        title: '自己发布不可加！',
      })
      return false;
    } else {
      var arr = wx.getStorageSync('cart') || [];
      arr.push(that.data.publishinfo);
      console.log(arr);
      wx.setStorageSync('cart', arr);
      wx.showToast({
        title: '加购物车成功！',
      })
    }
  },
  //购买检测
  buy() {
    var that = this;
    if (!app.globalData.openid) {
      wx.showModal({
        title: '温馨提示',
        content: '该功能需要注册才能使用，是否注册？',
        success(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login',
            })
          }
        }
      })
      return false
    } else if (that.data.selluserinfo._openid == app.globalData.openid) {
      wx.showToast({
        title: '自己发布不可买！',
      })
      return false;
    } else {
      that.checkBuyway();
      that.setData({
        showBuy: true,
      });
    }

  },

  //关闭购买弹窗
  closeBuy() {
    this.setData({
      showBuy: false
    })
  },
  //关闭出租弹窗
  closeRentBuy() {
    this.setData({
      showRentBuy: false
    })
  },
  //自动选择
  checkBuyway() {
    var that = this;
    var sellCampus = that.data.selluserinfo.campus.id;
    var buyCampus = that.data.buyuserinfo.campus.id;
    //console.log(sellCampus)
    //买卖双方都来自安徽农业大学
    if (sellCampus == 0 && buyCampus == 0) {
      that.setData({
        sameCampus: true,
        chooseDelivery: 0,
        "delivery[0].check": true
      });

    } else {
      that.setData({
        sameCampus: false,
        chooseDelivery: 1,
        "delivery[0].check": false,
        "delivery[1].check": true
      })
    }

  },

  //取货方式改变
  delChange(e) {
    var that = this;
    var delivery = that.data.delivery;
    var id = e.detail.value;
    for (var i = 0; i < delivery.length; i++) {
      delivery[i].check = false
    }
    delivery[id].check = true;
    if (id == 1) {
      that.setData({
        delivery: delivery,
        chooseDelivery: 1
      })
    } else {
      that.setData({
        delivery: delivery,
        chooseDelivery: 0
      })
    }
  },

  //出租下单
  rentBuy() {
    var that = this;
    if (!app.globalData.openid) {
      wx.showModal({
        title: '温馨提示',
        content: '该功能需要注册才能使用，是否注册？',
        success(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login',
            })
          }
        }
      })
      return false
    } else if (that.data.selluserinfo._openid == app.globalData.openid) {
      wx.showToast({
        title: '自己发布不可买！',
      })
      return false;

    } else if (that.data.selluserinfo.campus.id !== app.globalData.openid.campus.id) {
      wx.showToast({
        title: '必须同校才可！',
      })
      return false;

    } else {
      that.setData({
        showRentBuy: true
      })

    }


  },
  //获取订单状态
  getStatus() {
    var that = this;
    var _id = that.data.publishinfo._id;
    db.collection('publish').doc(_id).get({
      success(e) {
        if (e.data.status == 0) {
          //如果在售中，即可提交购买
          that.paypost();
        } else {
          wx.showToast({
            title: '该书暂时无货！',
          })
        }
      }
    })
  },

  //提交订单
  paypost() {
    var that = this;
    wx.showLoading({
      title: '正在下单中...',
    });
    // 利用云开发接口，调用云函数发起订单
    wx.cloud.callFunction({
      name: 'pay',
      data: {
        $url: "pay", //云函数路由参数
        goodId: that.data.publishinfo._id
      },
      success: res => {
        wx.hideLoading();
        that.pay(res.result)
      },
      fail(err) {
        wx.hideLoading();
        wx.showToast({
          title: '下单失败，重下！',
        })
        console.log(err)
      }
    });
  },

  //实现小程序支付
  pay(payData) {
    var that = this;
    //官方标准的支付方法
    wx.requestPayment({
      timeStamp: payData.timeStamp,
      nonceStr: payData.nonceStr,
      package: payData.package, //统一下单接口返回的 prepay_id 格式如：prepay_id=***
      signType: 'MD5',
      paySign: payData.paySign, //签名
      success(res) {
        that.setStatus();
        wx.showToast({
          title: '付款成功！',
        })
      },
      fail(err) {
        wx.showToast({
          title: '付款失败，请重新下单！',
        })
      }
    })
  },

  //修改卖家书籍在售状态
  setStatus() {
    var that = this
    wx.showLoading({
      title: '正在处理',
    })
    // 利用云开发接口，调用云函数发起订单
    wx.cloud.callFunction({
      name: 'pay',
      data: {
        $url: "changeP", //云函数路由参数
        _id: that.data.publishinfo._id,
        status: 1
      },
      success: res => {
        wx.hideLoading();
        console.log('修改订单状态成功')
        that.creatOrder();
      },
      fail(e) {
        wx.hideLoading();
        wx.showToast({
          title: '订单状态修改异常！',
        })
      }
    })
  },

  wxInput(e) {
    this.setData({
      buywx: e.detail.value
    })
  },

  buyName(e) {
    this.setData({
      "buylog.buyName": e.detail.value
    })
  },
  buyPhone(e) {
    this.setData({
      "buylog.buyPhone": e.detail.value
    })
  },
  buyPlace(e) {
    this.setData({
      "buylog.buyPlace": e.detail.value
    })
  },
  buyOther(e) {
    this.setData({
      "buylog.buyOther": e.detail.value
    })
  },


  //创建订单
  creatOrder() {
    var that = this;
    if (that.data.publishinfo.chooseId == 0) {
      var price = Number(that.data.publishinfo.sellPrice);
      var dayPrice = 0;
    } else {
      var price = that.data.publishinfo.bookinfo.price;
      var dayPrice = that.data.publishinfo.rentPrice
    }
    db.collection('order').add({
      data: {
        creatTime: new Date().getTime(),
        backTime: '',
        status: 1, //0在售；1买家已付款，但卖家未发货；2买家确认收获，交易完成；3、交易作废，退还买家钱款
        price: price, //售价
        dayPrice: dayPrice, //日租价
        deliveryid: that.data.chooseDelivery, //0面交1物流
        chooseId: that.data.publishinfo.chooseId, //0出售，1出租
        buywx: that.data.buywx, //面交时微信
        buylog: { //物流时买家填的地址
          buyName: that.data.buylog.buyName,
          buyPhone: that.data.buylog.buyPhone,
          buyPlace: that.data.buylog.buyPlace,
          buyOther: that.data.buylog.buyOther,
        },
        bookinfo: {
          _id: that.data.bookinfo._id,
          author: that.data.bookinfo.author,
          edition: that.data.bookinfo.edition,
          pic: that.data.bookinfo.pic,
          title: that.data.bookinfo.title,
        },
        selleropenid: that.data.publishinfo._openid,
        sellid: that.data.publishinfo._id,
        ems: ''
      },
      success(e) {
        wx.hideLoading();
        console.log('订单创建成功！')
        that.history('购买书籍', price, 2, e._id)
      },
      fail() {
        wx.hideLoading();
        console.log('订单创建失败！')
        wx.showToast({
          title: '发生异常，请及时和管理人员联系处理',
        })
      }
    })
  },

  //地址输入
  // placeInput(e) {
  //   this.data.place = e.detail.value
  // },

  //分享在售书籍
  onShareAppMessage() {
    if (this.data.publishinfo.chooseId == 0) {
      var price = this.data.publishinfo.sellPrice
    } else {
      var price = this.data.publishinfo.rentPrice
    }
    return {
      title: '这本《' + this.data.bookinfo.title + '》只要￥' + price + '元，快来看看吧',
      path: '/pages/detail/detail?scene=' + this.data.publishinfo._id,
    }
  },

  //历史记录
  //记录两次，一次相当于使用微信支付充值，第二次是用于购买书籍付款
  history(name, num, type, id) {
    var that = this;
    db.collection('history').add({
      data: {
        stamp: new Date().getTime(),
        type: 1, //1充值2支付
        name: '微信支付',
        num: num,
        oid: app.globalData.openid,
      },
      success: function (res) {
        db.collection('history').add({
          data: {
            stamp: new Date().getTime(),
            type: type, //1充值2支付
            name: name,
            num: num,
            oid: app.globalData.openid,
          },
          success: function (res) {
            wx.hideLoading();
            that.sms();
            //that.tip();
            wx.redirectTo({
              url: '/pages/success/success?id=' + id,
            })
          }
        })
      },
    })
  },

  //订单短信提醒
  sms() {
    var that = this;
    wx.cloud.callFunction({
      name: 'sms',
      data: {
        mobile: that.data.selluserinfo.phone,
        type: 1, //1为下单提醒；2为发货提醒；3为收货提醒
      },
      success: res => {
        console.log(that.data.selluserinfo.phone);
        console.log(res);
        console.log('短信发送成功！')
      },
      fail(err) {
        console.log('短信发送失败');
        console.log(err);
      }
    })
  },

  //邮件提醒收货
  tip() {
    var that = this;
    wx.cloud.callFunction({
      name: 'email',
      data: {
        type: 1, //1下单提醒2提醒收货
        email: that.data.userInfo.email,
        title: that.data.bookinfo.title,
      },
      success: res => {
        console.log(res)
      },
    })
  },


  //为了数据安全可靠，每次进入获取一次用户信息
  getuserdetail() {
    if (!app.globalData.openid) {
      wx.cloud.callFunction({
        name: 'regist', // 对应云函数名
        data: {
          $url: "getid", //云函数路由参数
        },
        success: re => {
          db.collection('user').where({
            _openid: re.result
          }).get({
            success: function (res) {
              if (res.data.length !== 0) {
                app.globalData.openid = re.result;
                app.globalData.userInfo = res.data[0];
                console.log(app.globalData.openid)
                console.log(app.globalData.userInfo)
              }
              console.log(res)
            }
          })
        }
      })
    }
  },

})