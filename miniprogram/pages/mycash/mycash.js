

var app = getApp()
var db = wx.cloud.database();
var common = require("../../common.js");
var _ = db.command;
// var config = {
//       appid: 'wx2cc7e47c681d1101', //小程序Appid
//       envName: 'shixian-jx2100', // 小程序云开发环境ID
//       mchid: '1587479591', //商户号
//       partnerKey: 'jianzhimin1735400430018755294439', //此处填服务商密钥
//       pfx: '', //证书初始化
//       fileID: 'cloud://shixian-jx2100.7368-shixian-jx2100-1301578378/apiclient_cert.p12', //证书云存储id
//       actionName: '安农大闲置书籍小程序提现',
//       rate: 1 //提现收取利率，1指的是每笔收取1%
// };

//var cloud = require('../../miniprogram_npm/wx-server-sdk'); 

//var tenpay = require('../../miniprogram_npm/tenpay');//支付核心模块

Page({

      data: {
            num: 0,
            key: '',
            times: 1,
      },
      onLoad() {
            this.getTimes();
            this.getnum();
            this.setData({
                  canReflect: app.canReflect
            })
      },
      //获取余额
      getnum() {
            var that = this;
            db.collection('user').where({
                  _openid: app.globalData.openid
            }).get({
                  success: function (res) {
                        console.log(res.data)
                        that.setData({
                              userid: res.data[0]._id,
                              num: res.data[0].parse,
                        });
                  },
                  fail() {
                        that.setData({
                              num: 0,
                        });
                        wx.showToast({
                              title: '获取失败',
                              icon: 'none'
                        })
                  }
            })
      },
      //金额输入
      keyInput(e) {
            this.setData({
                  key: e.detail.value
            })
      },
      //校检
      check(e) {
            var that = this;
            //每日仅限提现一次
            if (that.data.times > 0) {
                  wx.showToast({
                        title: '每日仅限提现一次，请明日再来',
                        icon: 'none',
                  })
                  return false;
            }
            //首先校检是否提交中
            if (!app.canReflect) {
                  return false
            }
            //校检金额不得为空
            if (!that.data.key) {
                  wx.showToast({
                        title: '请输入提现金额',
                        icon: 'none',
                  })
                  return false;
            }
            //校检金额不得低于10元
            var key = parseInt(that.data.key);
            // if (key < 10) {
            //       wx.showToast({
            //             title: '单笔提现金额不得低于10元',
            //             icon: 'none',
            //       })
            //       return false;
            // }
            //校检金额不得高于余额
            if (key > that.data.num) {
                  wx.showToast({
                        title: '余额不足',
                        icon: 'none',
                  })
                  return false;
            }
            //校检金额不得高于30
            if (key > 50) {
                  wx.showToast({
                        title: '单笔提现金额不得超过50元',
                        icon: 'none',
                  })
                  return false;
            }
            that.reflectpost();
      },
      //获取当天提现次数
      getTimes() {
            var that = this;
            db.collection('times').where({
                  _openid: app.globalData.openid,
                  days: common.days()
            }).count({
                  success: function (res) {
                        that.setData({
                              times: res.total
                        })
                  },
                  fail() {
                        that.setData({
                              times: 1
                        })
                  }
            })
      },
      //记录提现记录
      addTimes() {
            var that = this;
            db.collection('times').add({
                  data: {
                        days: common.days()
                  },
                  success: function (res) {
                        // console.log(res)
                  },
                  fail: console.error
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
                        oid: app.globalData.openid,
                  },
                  success: function (res) {
                        // console.log(res)
                  },
                  fail: console.error
            })
      },
      //提现提交
      reflectpost() {
            var that = this;
            wx.showLoading({
                  title: '正在提现...',
            });
            app.canReflect = false;
            that.setData({
                  canReflect: false,
            })
            //that.money();
            //利用云开发接口，调用云函数发起订单
            wx.cloud.callFunction({
                  name: 'cash',
                  data: {
                        userid: that.data.userid,
                        num: that.data.key,
                  },
                  success: res => {
                        console.log(res)
                        console.log(that.data.key)
                        if (res.result == 0) {
                              console.log('提现失败！');
                              console.log(res);
                              that.failref();
                        } else {
                              console.log('提现成功！');
                              console.log(res);
                              that.successref();
                        }
                  },
                  fail(err) {
                        that.failref();
                        console.log(err)
                  }
            });
      },
      //提现成功回调
      successref() {
            var that = this;
            //记录今日次数
            that.addTimes();
            that.setData({
                  num: that.data.num - that.data.key,
                  times: 1
            })
            that.history('余额提现', that.data.key, 2);
            wx.hideLoading();
            wx.showToast({
                  title: '提现成功',
                  icon: 'success'
            });
      },
      //提现失败回调
      failref() {
            wx.hideLoading();
            wx.showToast({
                  title: '提现失败，重试',
                  icon: 'none'
            });
            //释放禁用操作
            app.canReflect = true;
            this.setData({
                  canReflect: true,
            })
      },



      money() {
            var that = this;
            db.collection('user').doc(that.data.userid).get({
                  success(res) {
                        that.setData({
                              userInfo: res.data
                        })
                  }
            });
            if (Number(that.data.userInfo.parse) < Number(that.data.key)) {
                  return 0;
            }
            //首先获取证书文件
            var fileres = cloud.downloadFile({
                  fileID: config.fileID,
            })
            config.pfx = fileres.fileContent
            var pay = new tenpay(config, true)
            var result = pay.transfers({
                  partner_trade_no: 'bookcash' + Date.now() + that.data.key,
                  openid: userInfo._openid,
                  check_name: 'NO_CHECK',
                  amount: Number(that.data.key) * (100 - config.rate),
                  desc: config.actionName,
            });
            console.log(result);
            if (result.result_code == 'SUCCESS') {
                  //成功后操作
                  //以下是进行余额计算
                  db.collection('user').doc(that.data.userid).update({
                        data: {
                              parse: Number(that.data.userInfo.parse) - Number(that.data.key)
                        },
                        success: res => {
                              console.log(res)
                              if (res.result == 0) {
                                    console.log('提现失败！');
                                    console.log(res);
                                    that.failref();
                              } else {
                                    console.log('提现成功！');
                                    console.log(res);
                                    that.successref();
                              }
                        },
                        fail(err) {
                              that.failref();
                              console.log(err)
                        }
                  })


            }
      }








})