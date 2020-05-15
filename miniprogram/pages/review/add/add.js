// miniprogram/pages/review/add/add.js
var app = getApp()
var db = wx.cloud.database();
var common = require("../../../common.js");
var _ = db.command;

Page({

    /**
     * 页面的初始数据
     */
    data: {
        isbn: '',
        bookinfo: '',
        review: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.addReview();
    },

    addReview() {
        var that = this;
        wx.scanCode({
            success(res) {
                //console.log(res);
                wx.showToast({
                    title: '扫码成功',
                })
                that.setData({
                    isbn: res.result,
                })
                that.confimReview();
            },
            fail() {
                wx.showToast({
                    title: '扫码失败,重扫',
                })
                setTimeout(function () {
                    //要延时执行的代码
                    wx.navigateBack({
                    })
                }, 500)
            }
        })
    },

    confimReview() {
        var that = this;
        var isbn = that.data.isbn;
        that.getBook(isbn);
    },

    getBook(isbn) {
        var that = this;
        //先检查是否存在该书记录，没有再进行云函数调用
        db.collection('books').where({
            isbn: isbn
        }).get({
            success(res) {
                //库中没有便添加到数据库
                if (res.data == "") {
                    that.addBooks(isbn);
                } else {
                    //库中有直接提取信息
                    that.setData({
                        bookinfo: res.data[0],
                    })
                    console.log(that.data.bookinfo)
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
                            that.againGetBook(isbn);
                        },
                        fail(err) {

                        }
                    })
                }
            },
            fail: err => {
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
                that.setData({
                    bookinfo: res.data[0],
                })
                console.log(that.data.bookinfo)
            }
        })

    },

    //下拉刷新
    onPullDownRefresh() {
        this.confimReview();
        wx.stopPullDownRefresh({

        })
    },

    //记录评语
    addInput(e) {
        this.setData({
            review: e.detail.value
        })
    },

    //发表评语
    onReview() {
        var that = this;
        var review = that.data.review;
        var bookinfo = that.data.bookinfo;
        if (!review) {
            wx.showToast({
                title: '文字不能为空！',
            });
            return false;
        } else {
            db.collection('review').add({
                data: {
                    bookinfo: bookinfo,
                    review: review,
                    creatTime: Date.now(),
                    openId: app.globalData.openId,
                    userInfo: app.globalData.userInfo,

                },
                success(res) {
                    console.log(res);
                    console.log('添加评语成功！');
                    that.onSuccess();
                },
                fail(err) {
                    console.log(err)
                }
            });
            //     //调用云函数
            //     wx.cloud.callFunction({
            //         // 需调用的云函数名
            //         name: 'review',
            //         // 传给云函数的参数
            //         data: {
            //             type: 'add',
            //             bookinfo: bookinfo,
            //             review: review,

            //         },
            //         // 成功回调
            //         success(res) {
            //             console.log('储存到云端success');
            //             that.onSuccess();

            //         },
            //         fail(err) {
            //             console.log('储存到云端fail')
            //         }
            //     })

        }

    },
    onSuccess() {
        wx.showToast({
            title: '书评发表成功！',
        });
        setTimeout(function () {
            //要延时执行的代码
            wx.navigateBack({
              complete: (res) => {
                  
              },
            })
        }, 500)
    },

})