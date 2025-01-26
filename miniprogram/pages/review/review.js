// miniprogram/pages/review/review.js
var app = getApp()
var db = wx.cloud.database();
var common = require("../../common.js");
var _ = db.command;

Page({

    /**
     * 页面的初始数据
     */
    data: {
        tab: [{
                name: '他人书评',
                id: 0,
            },
            {
                name: '求购书籍',
                id: 1,
            },

        ],
        tabid: 0,
        list: [],
        bookinfo: '',
        userInfo: '',
        reqText: '',
        reqwx: '',
        reqlist: [],
        requserInfo: ''

    },

    //导航栏切换
    changeTab(e) {
        var that = this;
        that.setData({
            tabid: e.currentTarget.dataset.id
        })
        //that.getReview();
        if (that.data.tabid == 0) {
            that.getReview();
        } else {
            that.reqBook();
        }
    },



    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this;
        setTimeout(function () {
            if (that.data.tabid == 0) {
                that.getReview();
            } else {
                that.reqBook();
            }
        }, 500)


    },


    addReview() {
        if (!app.globalData.openid) {
            wx.showModal({
                title: '温馨提示',
                content: '该功能需要注册才能使用，是否马上去注册?',
                success(res) {
                    if (res.confirm) {
                        wx.navigateTo({
                            url: '/pages/login/login',
                        })
                    }
                }
            })
            return false
        } else {
            wx.navigateTo({
                url: '/pages/review/add/add',
            })

        }

    },

    getReview() {
        var that = this;
        db.collection('review').orderBy('creatTime', 'desc').get({
            // 成功回调
            success(res) {
                console.log('获取书评信息成功');
                //console.log(res);

                var data = res.data;
                that.setData({
                    list: data,
                    //userInfo:res.data.userInfo
                })
                console.log(that.data.list)
                //console.log(that.data.userInfo)
            },
            fail(err) {
                console.log('获取书评信息失败')
            }

        })



    },
    onPullDownRefresh() {
        var that = this;
        if (that.data.tabid == 0) {
            that.getReview();
            wx.stopPullDownRefresh({})
        } else {
            that.reqBook();
            wx.stopPullDownRefresh({})
        }
    },
    reqInput(e) {
        this.setData({
            reqText: e.detail.value
        })
    },
    reqwx(e) {
        this.setData({
            reqwx: e.detail.value
        })
    },
    addPublish() {
        var that = this;
        if (!app.globalData.openid) {
            wx.showModal({
                title: '温馨提示',
                content: '该功能需要注册才能使用，是否马上去注册?',
                success(res) {
                    if (res.confirm) {
                        wx.navigateTo({
                            url: '/pages/login/login',
                        })
                    }
                }
            })
            return false
        } else if (!that.data.reqText || !that.data.reqwx) {
            wx.showToast({
                title: '内容不能为空',
            })
            return false
        } else {
            db.collection('reqBook').add({
                data: {
                    reqText: that.data.reqText,
                    reqwx: that.data.reqwx,
                    creatTime: Date.now(),
                    openId: app.globalData.openId,
                    userInfo: app.globalData.userInfo,
                },
                success(res) {
                    console.log(res);
                    console.log('添加求购信息成功！');
                    wx.showToast({
                        title: '发布成功！',
                    })
                    that.reqBook();
                    that.setData({
                        reqText: '',
                        reqwx: ''
                    })
                },
                fail(err) {
                    console.log(err)
                    wx.showToast({
                        title: '发布失败！重试',
                    })
                }
            })
        }

    },

    reqBook() {
        var that = this;
        db.collection('reqBook').orderBy('creatTime', 'desc').get({
            // 成功回调
            success(res) {
                console.log('获取求购信息成功');
                //console.log(res.data);

                var data = res.data;
                that.setData({
                    reqlist: data,
                    //requserInfo:res.data.userInfo
                })
                console.log(that.data.reqlist)
                //console.log(that.data.requserInfo)
            },
            fail(err) {
                console.log('获取求购信息失败')
            }

        })
    },

    //回到顶部
    goTop() {
        wx.pageScrollTo({
            scrollTop: 0
        })
    }




})