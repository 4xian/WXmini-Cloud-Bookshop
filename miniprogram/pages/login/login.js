// miniprogram/pages/login/login.js

var db = wx.cloud.database();
var app = getApp();
var common = require("../../common.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ids: -1,
    campus: JSON.parse(common.data).campus,
    phone: '',
    email: '',
    wxnum: '',
    qqnum: '',
    


  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  //学校选择
  choose(e) {
    this.setData({
      ids: e.detail.value
    })
  },

  //各种账号输入
  phoneInput(e) {
    this.setData({
      phone: e.detail.value,
    })
    //console.log(this.data.phone);
  },
  wxInput(e) {
    this.setData({
      wxnum: e.detail.value,
    })
  },
  qqInput(e) {
    this.setData({
      qqnum: e.detail.value
    })
  },
  emailInput(e) {
    this.setData({
      email: e.detail.value
    })
  },

  //获取用户信息
  getUserInfo(e) {
    var that = this;
    console.log(e);
    var test = e.detail.errMsg.indexOf("ok");
    if (test == '-1') {
      wx.showToast({
        title: '授权后才可注册使用',
        duration: 2000
      });
    } else {
      that.setData({
        userInfo: e.detail.userInfo
      })
      //进行输入信息校验
      that.check();
    }
  },

  check() {
    var that = this;
    //校检手机
    var phone = that.data.phone;
    if (phone == '') {
      wx.showToast({
        title: '请先输入您的手机号',
        duration: 2000
      });
      return false
    }
    //校检校区
    var ids = that.data.ids;
    var campus = that.data.campus;
    if (ids == -1) {
      wx.showToast({
        title: '请先选择您的学校',
        duration: 2000
      });
    }
    //校检邮箱
    var email = that.data.email;
    console.log(email);
    //正则表达式验证  re.test(str)
    if (!(/^\w+((.\w+)|(-\w+))@[A-Za-z0-9]+((.|-)[A-Za-z0-9]+).[A-Za-z0-9]+$/.test(email))) {
      wx.showToast({
        title: '请输入常用邮箱',
        duration: 2000
      });
      return false;
    }
    //校检QQ号
    let qqnum = that.data.qqnum;
    if (qqnum !== '') {
      if (!(/^\s*[.0-9]{5,11}\s*$/.test(qqnum))) {
        wx.showToast({
          title: '请输入正确QQ号',
          icon: 'none',
          duration: 2000
        });
        return false;
      }
    }
    //校检微信号
    let wxnum = that.data.wxnum;
    if (wxnum !== '') {
      if (!(/^[a-zA-Z]([-_a-zA-Z0-9]{5,19})+$/.test(wxnum))) {
        wx.showToast({
          title: '请输入正确微信号',
          duration: 2000
        });
        return false;
      }
    }
    wx.showLoading({
      title: '正在注册中...',
    });
    db.collection('user').add({
      data: {
        phone: that.data.phone,
        campus: that.data.campus[that.data.ids],
        qqnum: that.data.qqnum,
        email: that.data.email,
        wxnum: that.data.wxnum,
        stamp: new Date().getTime(),
        info: that.data.userInfo,
        useful: true,
        parse: 0,
      },
      success: function (res) {
        //console.log(res)
        db.collection('user').doc(res._id).get({
          success: function (res) {
            //app.userInfo = res.data;
            //app.openid = res.data._openid;
            app.globalData.userInfo = res.data;
            app.globalData.openid = res.data._openid;
             wx.setStorage({
               key: 'userInfo',
               data: res.data,
             })
             wx.setStorage({
               key: 'openid',
               data: res.data._openid,
             })

            //console.log(app.userInfo);
            //console.log(app.globalData.userInfo)


            wx.showToast({
              title: '注册成功！',
            })
            setTimeout(function () {
              wx.navigateBack({
              })
            }, 500)

          },
        })
      },
      fail() {
        wx.hideLoading();
        wx.showToast({
          title: '注册失败,重新',
        })
      }
    })



  },


})