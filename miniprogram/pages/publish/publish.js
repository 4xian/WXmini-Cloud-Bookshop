// miniprogram/pages/publish/publish.js
var db = wx.cloud.database();
var app = getApp();
var common = require("../../common.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    bookinfo: '',
    systeminfo: app.systeminfo,
    college: JSON.parse(common.data).college.splice(1),
    //selluserinfo:app.globalData.userInfo,
  },

  //恢复初始态
  initial() {
    var that = this;
    that.setData({
      showInput:false,
      deadline: 30,
      sellPrice: '',
      rentPrice: '',
      place: '',
      chooseDelivery: 0,
      cids: '-1', //学院选择的默认值
      isbn: '',
      show_a: true,
      show_b: false,
      show_c: false,
      active: 0,
      chooseCollege: false,
      note_counts: 0,
      notes: '',
      kindid: 0,
      kind: [{
        name: '通用类',
        id: 0,
        check: true,
      }, {
        name: '专业书',
        id: 1,
        check: false
      }],
      delivery: [{
        name: '校内面交',
        id: 0,
        check: true,
      }, {
        name: '快递',
        id: 1,
        check: false
      }],
      sellChoose: [{
        name: '出售',
        id: 0,
        check: true,
      }, {
        name: '租借',
        id: 1,
        check: false
      }],
      chooseSell: 0,
    })
    
  },
  onLoad() {
    this.initial();
  },

  //手动输入isbn
  isbnInput(e) {
    this.data.isbn = e.detail.value;
    //console.log(this.data.isbn);
  },

  //打开摄像头扫码isbn
  scan() {
    var that = this;
    wx.scanCode({
      success: res => {
        wx.showToast({
          title: '扫码成功',
          icon: 'success'
        })
        that.setData({
          isbn: res.result
        })
        that.confirm();
      },
      fail() {
        wx.showToast({
          title: '扫码失败，重新扫码',
          icon: 'none'
        })
      }
    })
  },

  //提交书籍
  confirm() {
    var that = this;
    var isbn = that.data.isbn;
    //判断书籍号是否正确
    if (!(/978[0-9]{10}/.test(isbn))) {
      wx.showToast({
        title: '请扫描978开头的isbn号',
        icon: 'none'
      });
      return false;
    }
    if (!app.globalData.openid) {
      wx.showModal({
        title: '温馨提示',
        content: '该功能需要注册才能使用，是否马上去注册',
        success(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login',
            })
          }
        }
      })
      return false
    }
    that.getBook(isbn);
  },

  //查询书籍数据库详情
  getBook(isbn) {
    var that = this;
    wx.showLoading({
      title: '正在获取书籍...'
    })
    //先检查是否存在该书记录，没有再进行云函数调用
    db.collection('books').where({
      isbn: isbn
    }).get({
      success(res) {
        wx.hideLoading();
        //库中没有便添加到数据库
        if (res.data == "") {
          that.addBooks(isbn);
        } else {
          //库中有直接提取信息
          wx.hideLoading();
          that.setData({
            bookinfo: res.data[0],
            show_a: false,
            show_b: true,
            show_c: false,
          })
        }
      }
    })
  },
  //添加书籍信息到数据库
  addBooks(isbn) {
    var that = this;
    wx.cloud.callFunction({
      name: 'books',
      data: {
        $url: "bookinfo", //云函数路由参数
        isbn: isbn
      },
      success: res => {
        if (res.result.body.status == 0) {
          db.collection('books').add({
            data: res.result.body.result,
            success: function (res) {
              wx.hideLoading();
              that.againGetBook(isbn);
              // that.setData({
              //   bookinfo: res.result.body.result,
              //   show_a: false,
              //   show_b: true,
              //   show_c: false,

              // })
              // console.log(res.result.body.result);
            },
            fail(err) {
              wx.hideLoading();
              wx.showToast({
                title: '查询失败，请重试！',
              })
            }
          })
        }
      },
      fail: err => {
        wx.hideLoading();
        wx.showToast({
          title: '查询失败，请重试！',
        })
        console.error(err)
      }
    })
  },


  againGetBook(isbn) {
    var that = this;
    db.collection('books').where({
      isbn: isbn
    }).get({
      success(res) {
        //库中已添加书籍信息，可以直接提取信息
        wx.hideLoading();
        that.setData({
          bookinfo: res.data[0],
          show_a: false,
          show_b: true,
          show_c: false,
        })
        console.log(res.data[0])
      }
    })

  },

  //输入出售价格
  priceInput(e) {
    this.setData({
      sellPrice: e.detail.value
    })
  },
  //输入出租价格
  rentInput(e) {
    this.setData({
      rentPrice: e.detail.value
    });
    // console.log(this.data.rentPrice)
  },



  //地址输入
  placeInput(e) {
    this.setData({
      place: e.detail.value
    })

  },

  //专业类别
  kindChange(e) {
    var that = this;
    var kind = that.data.kind;
    var id = e.detail.value;
    for (var i = 0; i < kind.length; i++) {
      kind[i].check = false
    }
    kind[id].check = true;
    if (id == 1) {
      that.setData({
        kind: kind,
        chooseCollege: true,
        kindid: id
      })
    } else {
      that.setData({
        kind: kind,
        cids: '-1',
        chooseCollege: false,
        kindid: id
      })
    }
  },

  //选择书籍专业
  chooseCollege(e) {
    this.setData({
      cids: e.detail.value
    })
  },

  //取货方式改变
  // delChange(e) {
  //   var that = this;
  //   var delivery = that.data.delivery;
  //   var id = e.detail.value;
  //   for (var i = 0; i < delivery.length; i++) {
  //     delivery[i].check = false
  //   }
  //   delivery[id].check = true;
  //   if (id == 1) {
  //     that.setData({
  //       delivery: delivery,
  //       chooseDelivery: 1
  //     })
  //   } else {
  //     that.setData({
  //       delivery: delivery,
  //       chooseDelivery: 0
  //     })
  //   }
  // },

  //选择交易方式是出售还是租借
  delChange(e) {
    var that = this;
    var sellChoose = that.data.sellChoose;
    var id = e.detail.value;
    for (var i = 0; i < sellChoose.length; i++) {
      sellChoose[i].check = false
    }
    sellChoose[id].check = true;
    if (id == 1) {
      that.setData({
        sellChoose: sellChoose,
        chooseSell: 1, //租借
      })
    } else {
      that.setData({
        sellChoose: sellChoose,
        chooseSell: 0, //出售
      })
    }
  },

  //输入备注
  noteInput(e) {
    var that = this;
    that.setData({
      note_counts: e.detail.cursor,
      notes: e.detail.value,
    })
  },

  //发布时长
  deadInput(e) {
    this.setData({
      deadline: e.detail.value
    })
  },

  //发布校检
  check_pub() {
    var that = this;
    //如果用户选择了专业类书籍，需要选择学院
    if (that.data.kind[1].check) {
      if (that.data.cids == -1) {
        wx.showToast({
          title: '请选择学院',
        });
        return false;
      }
    }

    if (that.data.chooseSell == 1) {
      if (that.data.rentPrice == '' || that.data.rentPrice < 0.5) {
        wx.showToast({
          title: '租价不小于0.5',
        });
        return false;
      }
      if (that.data.rentPrice == '' || that.data.rentPrice > 3) {
        wx.showToast({
          title: '租价不大于3元',
        });
        return false;
      }
      //that.publish();
    }

    if (that.data.sellPrice == '' && that.data.chooseSell == 0) {
      wx.showToast({
        title: '请输入售价',
      });
      return false;
    }
    //如果用户选择了面交，需要填入详细地址
    // if (that.data.delivery[0].check) {
    //   if (that.data.place == '') {
    //     wx.showToast({
    //       title: '请输入面交详细地址',
    //     });
    //     return false;
    //   }
    // }
    that.publish();
  },

  //正式发布
  publish() {
    var that = this;
    wx.showModal({
      title: '温馨提示',
      content: '填写信息已无误，是否确认发布？',
      success(res) {
        if (res.confirm) {
          db.collection('publish').add({
            data: {
              creatTime: new Date().getTime(),
              //deadline: new Date().getTime() + that.data.deadline * (24 * 60 * 60 * 1000),
              status: 0, //0在售；1买家已付款，但卖家未发货；2买家确认收获，交易完成；3、交易作废，退还买家钱款
              sellPrice: that.data.sellPrice, //售价
              rentPrice: that.data.rentPrice, //租价
              //分类
              kindid: that.data.kindid, //区别通用还是专业
              collegeid: that.data.cids, //学院id，-1表示通用类
              deliveryid: that.data.chooseDelivery, //0面交 1快递
              chooseId: that.data.chooseSell, //0为出售，1为租借
              place: that.data.place, //选择自提时地址
              notes: that.data.notes, //备注
              //selluserinfo:that.data.selluserinfo,
              bookinfo: {
                _id: that.data.bookinfo._id,
                author: that.data.bookinfo.author,
                edition: that.data.bookinfo.edition,
                pic: that.data.bookinfo.pic,
                price: that.data.bookinfo.price,
                title: that.data.bookinfo.title,
              },
              key: that.data.bookinfo.title + that.data.bookinfo.keyword
            },
            success(e) {
              console.log(e)
              that.setData({
                show_a: false,
                show_b: false,
                show_c: true,
                //active: 2,
                detail_id: e._id
              });
              wx.navigateTo({
                url: '/pages/detail/detail?scene=' + this.data.detail_id,
              });
              this.initial();
              //滚动到顶部
              wx.pageScrollTo({
                scrollTop: 0,
              });

            },
            fail(err) {
              wx.showToast({
                title: '发布失败，重新发布',
              })
              that.setData({
                show_a: true,
                show_b: false,
                show_c: false,
              });
            }
          })
        }
      }
    })
  },

  detail() {
    var that = this;
    wx.navigateTo({
      url: '/pages/detail/detail?scene=' + that.data.detail_id,
    })
  },
  //下拉刷新
  onPullDownRefresh() {
    this.setData({
      show_a: true,
      show_b: false,
      show_c: false,
    });
    wx.stopPullDownRefresh({})
  },


  //手动输入ISBN
  inputIsbn(){
    this.setData({
      showInput:true
    })
  }

})