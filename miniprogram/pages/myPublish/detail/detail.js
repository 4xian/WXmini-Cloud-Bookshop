var app = getApp()
var db = wx.cloud.database();
var common = require("../../../common.js");
var _ = db.command;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showDelivery: false,
    checkDelivery: false,
    id: '',
    deliveryID: '', //输入物流单号
    ems: '', //从数据库查询物流单号
    deliveryData: {}, //物流全部信息
    deliveryMessages: [] //物流运送信息
  },
  onLoad: function (e) {
    var that = this;
    that.getdetail(e.id);

    this.setData({
      id: e.id
    })
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
    db.collection('order').where({
      //status: 1,
      sellid: _id
    }).get({
      success(e) {
        that.setData({
          creatTime: common.formTime(e.data[0].creatTime),
          detail: e.data[0],
          _id: e.data[0]._id

        })
        that.getBuyer(e.data[0]._openid);
      },
      fail() {
        wx.showToast({
          title: '获取失败，请稍后到订单中心内查看',
          icon: 'none'
        })
      }
    })
  },
  //获取买家信息
  getBuyer(m) {
    var that = this;
    db.collection('user').where({
      _openid: m
    }).get({
      success: function (res) {
        wx.hideLoading();
        that.setData({
          userinfo: res.data[0]
        })
      }
    })
  },

  //确认已还书
  confimBack(){
    var that = this;
    var day = Number((that.data.detail.backTime - that.data.detail.creatTime) /(3600*24*1000));
    var Day = day.toFixed(2);
    console.log(Day);
    var sellerMoney = Number(that.data.detail.dayPrice) * Number(Day)
    if(sellerMoney >= that.data.detail.price){
      sellerMoney = that.data.detail.price
    }
    wx.showModal({
      title: '建议此操作当面进行',
      content: '您确认已收到书吗？此操作不可逆,确认后钱款将打到您的余额',
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '正在处理...',
          })
          wx.cloud.callFunction({
            name: 'pay',
            data: {
              $url: "changeP", //云函数路由参数
              _id: that.data.detail.sellid,
              status: 2 //0在售；1买家已付款，但卖家未发货；2买家确认收获，交易完成；3、交易作废，退还买家钱款
            },
            success: res => {
              console.log('修改发布状态成功')
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
                      seller: that.data.detail.selleropenid,
                      num: sellerMoney
                    },
                    success(res) {
                      wx.hideLoading();
                      that.backBuyer();
                      //that.money();
                      console.log('还书成功！');
                      console.log(res);
                      //that.confirmtip();
                      //that.smstip();
                      wx.showToast({
                        title: '还书成功！',
                      })
                      that.getdetail(that.data.detail._id);
                    }
                  })
                },
              })
            },
          })
        }
      }
    })
  },
  //返还给买家余下钱款
  backBuyer(){
    var that = this;
    var day = (that.data.detail.backTime - that.data.detail.creatTime) /(3600*24*1000);
    var Day = day.toFixed(2);
    console.log(Day);
    var buyerMoney = Number(that.data.detail.price) - Number(that.data.detail.dayPrice) * Number(Day);
    if(buyerMoney <= 0){
      buyerMoney = 0;
    }
    wx.cloud.callFunction({
      name: 'his',
      data: {
        $url: "tobuyer", //云函数路由参数
        buyer: that.data.detail._openid,
        num: buyerMoney
      },
      success(e) {
        console.log(e)
        wx.hideLoading();
        console.log('已经返还余额给买家！')
       wx.navigateBack({
         complete: (res) => {},
       })
      }
    })
  },
  //取消交易
  cancel() {
    var that = this;
    wx.showModal({
      title: '温馨提示',
      content: '您确认要取消该订单交易吗',
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '正在处理',
          })
          wx.cloud.callFunction({
            name: 'pay',
            data: {
              $url: "changeP", //云函数路由参数
              _id: that.data.detail.sellid,
              status: 3 //0在售；1买家已付款，但卖家未发货；2买家确认收获，交易完成；3、交易作废，退还买家钱款
            },
            success: res => {
              console.log('修改订单状态成功')
              wx.cloud.callFunction({
                name: 'pay',
                data: {
                  $url: "changeO", //云函数路由参数
                  _id: that.data.detail._id,
                  status: 3 //0在售；1买家已付款，但卖家未发货；2买家确认收获，交易完成；3、交易作废，退还买家钱款
                },
                success: res => {
                  console.log('修改订单状态成功')
                  that.addhis();
                },
              })
            },
          })
        }
      }
    })
  },
  //退款给买家
  addhis() {
    var that = this;
    wx.cloud.callFunction({
      name: 'his',
      data: {
        $url: "tobuyer", //云函数路由参数
        buyer: that.data.detail._openid,
        num: that.data.detail.price
      },
      success(e) {
        console.log(e)
        wx.hideLoading();
        //that.canceltip();
        //页面栈返回
        let i = getCurrentPages()
        wx.navigateBack({
          success: function () {
            i[i.length - 2].onLoad(); // 执行前一个页面的onLoad方法
          }
        });
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

  //邮件提醒交易取消
  canceltip() {
    var that = this;
    wx.cloud.callFunction({
      name: 'email',
      data: {
        type: 3, //1下单提醒2提醒收货3取消交易
        email: that.data.userinfo.email,
        title: that.data.detail.bookinfo.title,
      },
      success: res => {
        console.log(res)
      },
    })
  },
  //邮件提醒收货
  emailTip() {
    var that = this;
    wx.showLoading({
      title: '发送中',
    })
    wx.cloud.callFunction({
      name: 'email',
      data: {
        type: 2, //1下单提醒2提醒收货
        email: that.data.userinfo.email,
        title: that.data.detail.bookinfo.title,
      },
      success: res => {
        console.log(res)
        wx.hideLoading();
        wx.showToast({
          title: '成功发送邮件提醒客户了',
          icon: 'none'
        })
      },
      fail(res) {
        console.log(res)
        wx.hideLoading();
        wx.showToast({
          title: '发送错误，请重新再试',
          icon: 'none'
        })
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

  //填写物流单号
  inDelivery() {
    this.setData({
      showDelivery: true
    })
  },

  //填单号
  delivery(e) {
    this.setData({
      deliveryID: e.detail.value
    })
    //console.log(this.data.deliveryID)
  },

  //关闭填写单号窗口
  closeDelivery() {
    this.setData({
      showDelivery: false
    })
  },

  //提交单号
  deliverySubmit() {
    var that = this;
    if (that.data.deliveryID == '') {
      wx.showToast({
        title: '单号不能为空！',
      })
      return false
    }
    db.collection('order').doc(that.data.detail._id).update({
      data: {
        ems: parseInt(that.data.deliveryID)
      },
      success(res) {
        console.log('更新物流单号成功！');
        wx.showToast({
          title: '提交成功！',
        })
        that.sms();
      },
      fail(err) {
        console.log(err);
        wx.showToast({
          title: '提交失败！重试',
        })
      }
    })
    console.log(that.data.deliveryID)
    that.setData({
      showDelivery: false,
    })

  },

  //展示物流窗口弹窗
  checkDelivery() {
    var that = this;
    var _id = that.data._id
    db.collection('order').doc(_id).get({
      success(res) {
        that.setData({
          ems: res.data.ems
        });
        console.log(that.data.ems)
        //请求物流状态
        wx.request({
          url: 'https://api.m.sm.cn/rest?method=kuaidi.getdata&sc=express_cainiao&q=%E5%BF%AB%E9%80%92' + that.data.ems + '&callback',
          success(res) {
            console.log(res.data);
            that.setData({
              deliveryData: res.data.data,
              deliveryMessages: res.data.data.messages,

            })
            //console.log(that.data.deliveryData);
            //console.log(that.data.deliveryMessages)
          }
        });
      },
      fail(err) {
        console.log(err)
      }
    })
    that.setData({
      checkDelivery: true
    })

  },

  //
  //关闭物流信息窗口
  closeCheckDelivery() {
    this.setData({
      checkDelivery: false
    })
  },

  //发货后短信提醒买家
  sms() {
    var that = this;
    wx.cloud.callFunction({
      name: 'sms',
      data: {
        mobile: that.data.userinfo.phone,
        type: 2
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

  //短信提醒买家收货
  tip() {
    var that = this;
    wx.cloud.callFunction({
      name: 'sms',
      data: {
        mobile: that.data.userinfo.phone,
        type: 3
      },
      success: res => {
        //console.log(that.data.userinfo.phone);
        console.log(res);
        console.log('短信发送成功！')
        wx.showToast({
          title: '已发送短信通知！',
        })
      },
      fail(err) {
        console.log('短信发送失败');
        console.log(err);
        wx.showToast({
          title: '提醒失败！重试',
        })
      }
    })
  }
})