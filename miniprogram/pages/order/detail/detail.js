var app = getApp()
var db = wx.cloud.database();
var common = require("../../../common.js");
var _ = db.command;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    selluserinfo: '',
    showDelivery: false,
    checkDelivery: false,
    ems: '',
    deliveryData: {}, //物流全部信息
    deliveryMessages: [] //物流运送信息
  },
  onLoad: function (e) {
    this.getdetail(e.id);
    this.setData({
      sellid: e.id
    })
  },
  //回到首页
  home() {
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
  //下拉刷新
  onPullDownRefresh() {
    this.getdetail(sellid);
    wx.stopPullDownRefresh({
      complete: (res) => {},
    })
  },
  //获取订单详情
  getdetail(_id) {
    var that = this;
    db.collection('order').doc(_id).get({
      success(e) {
        that.setData({
          creatTime: common.formTime(e.data.creatTime),
          detail: e.data,
          ems: e.data.ems
        })
        console.log(that.data.ems)
        that.getSeller(e.data.selleropenid);
      },
      fail() {
        wx.showToast({
          title: '获取失败，重试',

        })
      }
    })
  },
  //获取卖家信息
  getSeller(m) {
    var that = this;
    db.collection('user').where({
      _openid: m
    }).get({
      success: function (res) {
        wx.hideLoading();
        that.setData({
          userinfo: res.data[0]
        })
        //console.log(m);
        //console.log(that.data.userinfo)
      }
    })
  },
  //取消订单
  cancel() {
    var that = this;
    wx.showModal({
      title: '温馨提示',
      content: '您确认要取消该订单吗',
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '正在取消...',
          })
          wx.cloud.callFunction({
            name: 'pay',
            data: {
              $url: "changeP", //云函数路由参数
              _id: that.data.detail.sellid,
              status: 0 //0在售；1买家已付款，但卖家未发货；2买家确认收获，交易完成；3、交易作废，退还买家钱款
            },
            success: res => {
              console.log('修改书籍状态成功')
              wx.cloud.callFunction({
                name: 'pay',
                data: {
                  $url: "changeO", //云函数路由参数
                  _id: that.data.detail._id,
                  status: 3 //0在售；1买家已付款，但卖家未发货；2买家确认收获，交易完成；3、交易作废，退还买家钱款
                },
                success: res => {
                  console.log('修改订单状态成功')
                  that.up(that.data.detail.price); //返回钱到余额
                  that.canceltip();
                  that.getdetail(that.data.detail._id);
                },
                fail(e) {
                  wx.hideLoading();
                  wx.showToast({
                    title: '发生异常，请及时和管理人员联系处理',
                    icon: 'none'
                  })
                }
              })
            },
            fail(e) {
              wx.hideLoading();
              wx.showToast({
                title: '发生异常，请及时和管理人员联系处理',
                icon: 'none'
              })
            }
          })
        }
      }
    })
  },
  //确认收货
  confirm() {
    var that = this;
    wx.showModal({
      title: '温馨提示',
      content: '您确认已收货吗',
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '正在收货...',
          })
          wx.cloud.callFunction({
            name: 'pay',
            data: {
              $url: "changeP", //云函数路由参数
              _id: that.data.detail.sellid,
              status: 2 //0在售；1买家已付款，但卖家未发货；2买家确认收获，交易完成；3、交易作废，退还买家钱款
            },
            success: res => {
              console.log('修改书籍状态成功')
              wx.cloud.callFunction({
                name: 'pay',
                data: {
                  $url: "changeO", //云函数路由参数
                  _id: that.data.detail._id,
                  status: 2 //0在售；1买家已付款，但卖家未发货；2买家确认收获，交易完成；3、交易作废，退还买家钱款
                },
                success: res => {
                  console.log('修改订单状态成功')
                  wx.cloud.callFunction({
                    name: 'his',
                    data: {
                      $url: "toseller", //云函数路由参数
                      seller: that.data.userinfo._openid,
                      num: that.data.detail.price
                    },
                    success(res) {
                      wx.hideLoading();
                      //that.money();
                      console.log('收货成功！');
                      console.log(res);
                      //that.confirmtip();
                      that.smstip();
                      wx.showToast({
                        title: '收货成功！',
                      })
                      that.getdetail(that.data.detail._id);
                    }
                  })
                },
                fail(e) {
                  wx.hideLoading();
                  wx.showToast({
                    title: '发生异常，请及时和管理人员联系处理',
                    icon: 'none'
                  })
                }
              })
            },
            fail(e) {
              wx.hideLoading();
              wx.showToast({
                title: '发生异常，请及时和管理人员联系处理',
                icon: 'none'
              })
            }
          })
        }
      }
    })
  },

  //增加历史记录，更改余额
  money() {
    var that = this;
    var selleropenid = that.data.userinfo._openid
    //先增加历史记录
    db.collection('history').add({
      // data 字段表示需新增的 JSON 数据
      data: {
        oid: selleropenid,
        name: '完成出售',
        num: that.data.detail.price,
        stamp: new Date().getTime(),
        type: 1,
      },
      success(res) {
        console.log('成功')
        db.collection('user').where({
          _openid: selleropenid, // 卖家openid
        }).get({
          success(res) {
            var userinfo = res.data[0];
            console.log(userinfo);
            var price = Number(that.data.detail.price) + Number(userinfo.parse)
            //再修改钱包值
            db.collection('user').doc(userinfo._id).update({
              data: {
                parse: price
              },
              success(res) {
                console.log(res);
                console.log(price);
                //console.log(userinfo.parse);
                console.log('收货成功！')
              },
              fail(err) {
                console.log(err)
              }
            })
          },
          fail(err) {
            console.log(err)
          }
        })



      },
      fail(err) {
        console.log(err)
      }


    })
  },

  //还书
  returnBook() {
    var that = this;
    wx.showModal({
      title: '建议此操作当面进行',
      content: '您确认已还书吗，该操作需经过卖家同意，若卖家拒绝，则无效',
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '正在操作中...',
          })
          wx.cloud.callFunction({ //修改发布状态
            name: 'pay',
            data: {
              $url: "changeP", //云函数路由参数
              _id: that.data.detail.sellid,
              status: 4 //0在售；1买家已付款，但卖家未发货；2买家确认收获，交易完成；3、交易作废，退还买家钱款
            },
            success: res => {
              console.log('买家已提交还书')
              wx.cloud.callFunction({ //修改订单状态
                name: 'pay',
                data: {
                  $url: "changeO", //云函数路由参数
                  _id: that.data.detail._id,
                  status: 4 //0在售；1买家已付款，但卖家未发货；2买家确认收获，交易完成；3、交易作废，退还买家钱款
                },
                success: res => {
                  console.log('还书状态已修改');
                  //增加还书时间
                  db.collection('order').doc(that.data.detail._id).update({
                    data:{
                      backTime:new Date().getTime(),
                    },
                    success(res) {
                      wx.hideLoading();
                      wx.showToast({
                        title: '已向卖家提出请求',
                      })
                      console.log('已确定还书时间')
                    }
                  })
                  // wx.cloud.callFunction({
                  //   name: 'his',
                  //   data: {
                  //     $url: "toseller", //云函数路由参数
                  //     seller: that.data.userinfo._openid,
                  //     num: that.data.detail.price,//保证金
                  //   },
                  //   success(res) {
                  //     wx.hideLoading();
                  //     //that.money();
                  //     console.log('收货成功！');
                  //     console.log(res);
                  //     //that.confirmtip();
                  //     //that.smstip();
                  //     wx.showToast({
                  //       title: '收货成功！',
                  //     })
                      that.getdetail(that.data.detail._id);
                  //   }
                  // })
                },
                fail(e) {
                  wx.hideLoading();
                  wx.showToast({
                    title: '发生异常，请及时和管理人员联系处理',
                    icon: 'none'
                  })
                }
              })
            },
            fail(e) {
              wx.hideLoading();
              wx.showToast({
                title: '发生异常，请及时和管理人员联系处理',
                icon: 'none'
              })
            }
          })
        }
      }
    })
  },


  //删除订单
  delete() {
    var that = this;
    wx.showModal({
      title: '温馨提示',
      content: '您确认要删除此订单吗',
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '正在删除...',
          })
          db.collection('order').doc(that.data.detail._id).remove({
            success() {
              //页面栈返回
              var i = getCurrentPages()
              wx.navigateBack({
                success: function () {
                  i[i.length - 2].getlist();
                }
              });
            },
            fail: console.error
          })
        }
      }
    })
  },
  //复制
  copy(e) {
    wx.setClipboardData({
      data: e.currentTarget.dataset.copy,
      success: res => {
        wx.showToast({
          title: '复制' + e.currentTarget.dataset.name + '成功',
          icon: 'success',
          duration: 1000,
        })
      }
    })
  },
  //电话拨打
  phone(e) {
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.phone
    })
  },
  //余额计算
  up(num) {
    var that = this;
    wx.cloud.callFunction({
      name: 'his',
      data: {
        $url: "recharge", //云函数路由参数
        num: num
      },
      success(e) {
        wx.showToast({
          title: '取消成功',
          icon: 'success',
        })
        that.history('取消订单退款', num, 1);
      },
      fail(e) {
        wx.showToast({
          title: '发送错误，请联系管理员',
          icon: 'none'
        })
      }
    })
  },
  //历史记录
  history(name, num, type) {
    var that = this;
    db.collection('history').add({
      data: {
        stamp: new Date().getTime(),
        type: type, //1充值2支付
        name: name,
        num: num,
        oid: app.globalData.openid
      },
      success: function (res) {
        console.log(res)
      },
      fail: console.error
    })
  },
  //邮件提醒交易取消
  // canceltip() {
  //   var that = this;
  //   wx.cloud.callFunction({
  //     name: 'email',
  //     data: {
  //       type: 4, //1下单提醒2提醒收货3取消交易4取消订单5交易完成
  //       email: that.data.userinfo.email,
  //       title: that.data.detail.bookinfo.title,
  //     },
  //     success: res => {
  //       console.log(res)
  //     },
  //   })
  // },
  //邮件提醒订单完成
  confirmtip() {
    var that = this;
    wx.cloud.callFunction({
      name: 'email',
      data: {
        type: 5, //1下单提醒2提醒收货3取消交易4取消订单5交易完成
        email: that.data.userinfo.email,
        title: that.data.detail.bookinfo.title,
      },
      success: res => {
        console.log(res)
      },
    })
  },

  //买家取消交易后短信提醒卖家
  canceltip() {
    var that = this;
    wx.cloud.callFunction({
      name: 'sms',
      data: {
        mobile: that.data.userinfo.phone,
        type: 5
      },
      success: res => {
        //console.log(that.data.userinfo.phone);
        console.log(res);
        console.log('短信发送成功！')
      },
      fail(err) {
        console.log('短信发送失败');
        console.log(err);
      }
    })
  },
  //买家收货后短信提醒卖家
  smstip() {
    var that = this;
    wx.cloud.callFunction({
      name: 'sms',
      data: {
        mobile: that.data.userinfo.phone,
        type: 4
      },
      success: res => {
        //console.log(that.data.userinfo.phone);
        console.log(res);
        console.log('短信发送成功！')
      },
      fail(err) {
        console.log('短信发送失败');
        console.log(err);
      }
    })
  },
  //展示物流窗口弹窗
  checkDelivery() {
    var that = this;
    //请求物流状态
    wx.request({
      url: 'https://api.m.sm.cn/rest?method=kuaidi.getdata&sc=express_cainiao&q=%E5%BF%AB%E9%80%92' + that.data.ems + '&callback',
      success(res) {
        console.log(res.data.data);
        that.setData({
          deliveryData: res.data.data,
          deliveryMessages: res.data.data.messages
        })
        //console.log(that.data.deliveryData);
        //console.log(that.data.deliveryMessages)
      }
    })
    that.setData({
      checkDelivery: true
    })
  },

  //关闭物流窗口
  closeDelivery() {
    this.setData({
      checkDelivery: false
    })
  },

})