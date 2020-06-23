// miniprogram/pages/admin/admin.js
import * as echarts from '../../ec-canvas/echarts';
var app = getApp()
var db = wx.cloud.database();
var common = require("../../common.js");
var _ = db.command;

//三个图表函数
function getSexOption() {
    var usersum = app.globalData.usersum;
    var mensum = app.globalData.mensum ;
    var women = usersum - mensum;
    return {
        tooltip: {
            trigger: 'item',
            formatter: '{b}: ({c})'
        },
        legend: {
            orient: 'vertical',
            left: 10,
            data: ['男', '女']
        },
        title: {
            text: '注册用户男女比例统计',
            subtext: '用户总数：' + Number(usersum),
            left: 'center'
        },
        backgroundColor: "#ffffff",
        color: ["#32C5E9", "pink"],
        series: [{
            label: {
                normal: {
                    fontSize: 14
                }
            },
            type: 'pie',
            avoidLabelOverlap: false,
            center: ['50%', '60%'],
            radius: ['30%', '50%'],
            labelLine: {
                show: false
            },
            data: [{
                value: Number(mensum),
                name: '男'
            }, {
                value: Number(women),
                name: '女'
            }],
            emphasis: {

                label: {
                    show: true,
                    fontSize: '20',
                    fontWeight: 'bold'
                }
            }
        }],
    }
}

function getOrderOption() {
    var ordersum = app.globalData.ordersum;
    var onordersum = app.globalData.onordersum;
    var inordersum = app.globalData.inordersum;
    var doneordersum = app.globalData.doneordersum;
    var canclordersum = app.globalData.canclordersum;
    return {
        tooltip: {
            trigger: 'item',
            formatter: '{b}: ({c})'
        },
        legend: {
            orient: 'vertical',
            left: 10,
            data: ['在售中', '交易中', '已完成', '已取消']
        },
        title: {
            text: '订单比例统计',
            // subtext: '订单总数：' + 20,
            left: 'center'
        },
        backgroundColor: "#ffffff",
        color: ["green", "red", "blue", "yellow"],
        series: [{
            label: {
                normal: {
                    fontSize: 14
                }
            },
            type: 'pie',
            avoidLabelOverlap: false,
            center: ['50%', '60%'],
            radius: ['30%', '50%'],
            labelLine: {
                show: false
            },
            data: [{
                value: Number(onordersum),
                name: '在售中'
            }, {
                value: Number(inordersum),
                name: '交易中'
            }, {
                value: Number(doneordersum),
                name: '已完成'
            }, {
                value: Number(canclordersum),
                name: '已取消'
            }],
            emphasis: {

                label: {
                    show: true,
                    fontSize: '20',
                    fontWeight: 'bold'
                }
            }
        }],
    }
}
function getPublishOption() {
    return {
        tooltip: {
            trigger: 'item',
            formatter: '{b}: ({c})'
        },
        legend: {
            // orient: 'vertical',
            // left: 10,
            // data: ['在售中', '交易中', '已完成', '已取消']
        },
        title: {
            text: '发布书籍类别统计',
            // subtext: '订单总数：' + 20,
            left: 'center'
        },
        xAxis:{
            data:["通用","考研","信计","经管","土木","农学","电气","心里","其他"],
            axisLabel:{
                fontSize:10
            }
        },
        backgroundColor: "#ffffff",
        yAxis:{},
        color:"#6699CC",
        series: [{
            label: {
                normal: {
                    fontSize: 10
                }
            },
            type: 'bar',
            barWidth:'30%',
            avoidLabelOverlap: false,
            data: [
                app.globalData.publicsum,
                app.globalData.kaoyansum,
                app.globalData.xinjisum,
                app.globalData.jingguansum,
                app.globalData.tumusum,
                app.globalData.nongxuesum,
                app.globalData.dianqisum,
                app.globalData.xinlisum,
                app.globalData.othersum
            ],
            emphasis: {

                label: {
                    show: true,
                    fontSize: '20',
                    fontWeight: 'bold'
                }
            }
        }],
    }
}

Page({

    /**
     * 页面的初始数据
     */
    data: {
        admin: true,
        adminMenu: false,
        tab: [{
                name: '用户管理',
                id: 0,
            },
            {
                name: '书籍管理',
                id: 1,
            },
            {
                name: '书圈管理',
                id: 2,
            },
            {
                name: '订单管理',
                id: 3,
            },
            {
                name: '数据统计',
                id: 4,
            }
        ],
        tabid: 0,
        reviewTab: [{
                name: '书评管理',
                id: 0,
            },
            {
                name: '求购管理',
                id: 1,
            },
        ],
        reviewtabid: 0,
        userMenu: true,
        bookMenu: false,
        reviewMenu: false,
        orderMenu: false,
        echartMenu: false,

        nomore: false,
        reqBookMenu: false,
        reviewBookMenu: true,

        userPage: 0,
        bookPage: 0,
        orderPage: 0,
        reviewPage: 0,
        reqBookPage: 0,


        //图表准备
        ecSex: {
            onInit: function (canvas, width, height, dpr) {
                var barChart = echarts.init(canvas, null, {
                    width: width,
                    height: height,
                    devicePixelRatio: dpr // new
                });
                canvas.setChart(barChart);
                barChart.setOption(getSexOption());

                return barChart;
            }
        },

        ecOrder: {
            onInit: function (canvas, width, height, dpr) {
                var scatterChart = echarts.init(canvas, null, {
                    width: width,
                    height: height,
                    devicePixelRatio: dpr // new
                });
                canvas.setChart(scatterChart);
                scatterChart.setOption(getOrderOption());

                return scatterChart;
            }
        },
        ecPublish: {
            onInit: function (canvas, width, height, dpr) {
                var scatterChart = echarts.init(canvas, null, {
                    width: width,
                    height: height,
                    devicePixelRatio: dpr // new
                });
                canvas.setChart(scatterChart);
                scatterChart.setOption(getPublishOption());

                return scatterChart;
            }
        }

    },



    onLoad: function (options) {
        var that = this;
        that.userList();
        that.bookList();
        that.onordersum();
        that.inordersum();
        that.doneordersum();
        that.canclordersum();
    },

    adminName(e) {
        this.setData({
            adminName: e.detail.value
        })
    },
    adminPass(e) {
        this.setData({
            adminPass: e.detail.value
        })
    },

    //管理员登录
    adminLogin() {
        var that = this;
        if (that.data.adminName == '' && that.data.adminPass == '') {
            console.log('管理员登录成功');
            that.setData({
                admin: false,
                adminMenu: true
            });
            wx.showToast({
                title: '登录成功！',
            })
        } else {
            wx.showToast({
                title: '账号密码不正确！',
            })
            return false;
        }
    },


    //第一层导航栏切换
    changeTab(e) {
        var that = this;
        that.setData({
            tabid: e.currentTarget.dataset.id
        })
        if (that.data.tabid == 0) {
            that.userList();
            that.setData({
                userMenu: true,
                bookMenu: false,
                reviewMenu: false,
                orderMenu: false,
                echartMenu: false,
            })

        }
        if (that.data.tabid == 1) {
            that.setData({
                userMenu: false,
                bookMenu: true,
                reviewMenu: false,
                orderMenu: false,
                echartMenu: false,
            })
            that.bookList();

        }
        if (that.data.tabid == 2) {
            that.reviewList();
            that.setData({
                userMenu: false,
                bookMenu: false,
                reviewMenu: true,
                orderMenu: false,
                reviewBookMenu: true,
                reqBookMenu: false,
                reviewtabid: 0,
                echartMenu: false,
            })
        }
        if (that.data.tabid == 3) {
            that.orderList();
            that.setData({
                userMenu: false,
                bookMenu: false,
                reviewMenu: false,
                orderMenu: true,
                echartMenu: false,
            })
        }
        if (that.data.tabid == 4) {

            that.setData({
                userMenu: false,
                bookMenu: false,
                reviewMenu: false,
                orderMenu: false,
                echartMenu: true,
            })
            that.onordersum();
            that.inordersum();
            that.doneordersum();
            that.canclordersum();
        }

    },

    //书圈管理导航栏切换
    changeReviewTab(e) {
        var that = this;
        that.setData({
            reviewtabid: e.currentTarget.dataset.id
        });
        if (that.data.reviewtabid == 0) {
            that.reviewList();
            that.setData({
                reqBookMenu: false,
                reviewBookMenu: true,
            })
        }
        if (that.data.reviewtabid == 1) {
            that.reqBookList();
            that.setData({
                reqBookMenu: true,
                reviewBookMenu: false,
            })
        }
    },

    //获取用户
    userList() {
        var that = this;
        db.collection('user').get({
            success(res) {
                console.log(res.data);
                that.setData({
                    userList: res.data
                })
                app.globalData.usersum = that.data.userList.length;
            }
        });
        db.collection('user').where({
            "info.gender": 1
        }).get({
            success(res) {
                //console.log(res.data);
                that.setData({
                    menuserList: res.data
                })
                app.globalData.mensum = that.data.menuserList.length;
                console.log(app.globalData.mensum)
            }
        });

    },

    //获取更多用户记录
    userMore() {
        var that = this;
        if (that.data.nomore || that.data.userList.length < 20) {
            return false
        }
        var page = that.data.userPage + 1;
        db.collection('user').skip(page * 20).get({
            success(res) {
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
                    userList: that.data.userList.concat(res.data)
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

    //删除用户
    deleteUser: function (e) {
        var that = this;
        wx.showModal({
            title: '温馨提示',
            content: '确认要删除此用户吗？',
            success(res) {
                if (res.confirm) {
                    wx.showLoading({
                        title: '正在删除...',
                    })
                    //console.log(e.currentTarget.dataset.id)
                    db.collection('user').doc(e.currentTarget.dataset.id).remove({
                        success(res) {
                            console.log(res);
                            console.log('删除用户成功！');
                            wx.hideLoading({});
                            wx.showToast({
                                title: '删除该用户成功！',
                            });
                            that.userList();
                        },
                        fail(err) {
                            console.log(err);
                            console.log('删除失败！');
                            wx.hideLoading({});
                            wx.showToast({
                                title: '删除失败！',
                            })
                        }
                    })
                }
            }
        })
    },


    //获取发布书籍
    bookList() {
        var that = this;
        db.collection('publish').orderBy('creatTime', 'desc').get({
            success(res) {
                console.log(res.data);
                that.setData({
                    bookList: res.data,
                    length: res.data.length
                })
                var arr = res.data;
                var length = res.data.length;

                var publicarr = [];
                var kaoyanarr = [];
                var xinjiarr  =[];
                var jingguanarr = [];
                var tumuarr = [];
                var nongxuearr = [];
                var dianqiarr = [];
                var xinliarr = [];
                var otherarr = []

                for (var i = 0; i < length; i++) {
                    if (arr[i].collegeid == -1) {
                        publicarr.push(arr[i])
                    };
                    if (arr[i].collegeid == 0) {
                        kaoyanarr.push(arr[i])
                    };
                    if (arr[i].collegeid == 1) {
                        xinjiarr.push(arr[i])
                    };
                    if (arr[i].collegeid == 2) {
                        jingguanarr.push(arr[i])
                    };
                    if (arr[i].collegeid == 3) {
                        tumuarr.push(arr[i])
                    };
                    if (arr[i].collegeid == 4) {
                        nongxuearr.push(arr[i])
                    };
                    if (arr[i].collegeid == 5) {
                        dianqiarr.push(arr[i])
                    };
                    if (arr[i].collegeid == 6) {
                        xinliarr.push(arr[i])
                    };
                    if (arr[i].collegeid == 7) {
                        otherarr.push(arr[i])
                    };

                }
                app.globalData.publicsum = publicarr.length;
                app.globalData.kaoyansum = kaoyanarr.length;
                app.globalData.xinjisum = xinjiarr.length;
                app.globalData.jingguansum = jingguanarr.length;
                app.globalData.tumusum = tumuarr.length;
                app.globalData.nongxuesum = nongxuearr.length;
                app.globalData.dianqisum = dianqiarr.length;
                app.globalData.xinlisum = xinliarr.length;
                app.globalData.othersum = otherarr.length;

            }
        });
        //that.check()
    },

    //获取更多书籍
    bookMore() {
        var that = this;
        if (that.data.nomore || that.data.bookList.length < 20) {
            return false
        }
        var page = that.data.bookPage + 1;
        db.collection('publish').orderBy('creatTime', 'desc').skip(page * 20).get({
            success(res) {
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
                    bookList: that.data.bookList.concat(res.data)
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
        var that = this;
        if (that.data.tabid == 0) {
            that.userMore();
        }
        if (that.data.tabid == 1) {
            that.bookMore();
        }
        if (that.data.tabid == 2) {
            if (that.data.reviewtabid == 0)
                that.reviewMore();
            if (that.data.reviewtabid == 1)
                that.reqBookMore();
        }
        if (this.data.tabid == 3) {
            this.orderMore();
        }

    },

    //回到顶部
    goTop() {
        wx.pageScrollTo({
            scrollTop: 0
        })
    },

    //删除在售书籍
    deleteBook(e) {
        var that = this;
        wx.showModal({
            title: '温馨提示',
            content: '确认要删除该书籍吗？',
            success(res) {
                if (res.confirm) {
                    wx.showLoading({
                        title: '正在删除...',
                    })
                    //console.log(e.currentTarget.dataset.id)
                    db.collection('publish').doc(e.currentTarget.dataset.id).remove({
                        success(res) {
                            console.log(res);
                            console.log('删除书籍成功！');
                            wx.hideLoading({});
                            wx.showToast({
                                title: '删除书籍成功！',
                            });
                            that.bookList();
                        },
                        fail(err) {
                            console.log(err);
                            console.log('删除失败！');
                            wx.hideLoading({});
                            wx.showToast({
                                title: '删除失败！',
                            })
                        }
                    })
                }
            }
        })
    },

    //订单获取
    orderList() {
        var that = this;
        db.collection('publish').orderBy('creatTime', 'desc').get({
            success(res) {
                console.log(res.data);
                that.setData({
                    orderList: res.data
                })
                app.globalData.ordersum = that.data.orderList.length;
            }
        });

    },

    

    //查询在售中
    onordersum() {
        var that = this;
        db.collection('publish').where({
            status: 0
        }).orderBy('creatTime', 'desc').get({
            success(res) {
                //console.log(res.data);

                app.globalData.onordersum = res.data.length;
            }
        });
    },
    //查询交易中
    inordersum() {
        var that = this;
        db.collection('publish').where({
            status: 1
        }).orderBy('creatTime', 'desc').get({
            success(res) {
                //console.log(res.data);

                app.globalData.inordersum = res.data.length;
            }
        });
    },
    //查询已完成
    doneordersum() {
        var that = this;
        db.collection('publish').where({
            status: 2
        }).orderBy('creatTime', 'desc').get({
            success(res) {
                //console.log(res.data);

                app.globalData.doneordersum = res.data.length;
            }
        });
    },
    //查询已取消
    canclordersum() {
        var that = this;
        db.collection('publish').where({
            status: 3
        }).orderBy('creatTime', 'desc').get({
            success(res) {
                //console.log(res.data);

                app.globalData.canclordersum = res.data.length;
            }
        });
    },


    //订单删除
    deleteOrder(e) {
        var that = this;
        wx.showModal({
            title: '温馨提示',
            content: '确认要删除该书籍吗？',
            success(res) {
                if (res.confirm) {
                    wx.showLoading({
                        title: '正在删除...',
                    })
                    //console.log(e.currentTarget.dataset.id)
                    db.collection('publish').doc(e.currentTarget.dataset.id).remove({
                        success(res) {
                            console.log(res);
                            console.log('删除订单成功！');
                            wx.hideLoading({});
                            wx.showToast({
                                title: '删除订单成功！',
                            });
                            that.orderList();
                        },
                        fail(err) {
                            console.log(err);
                            console.log('删除失败！');
                            wx.hideLoading({});
                            wx.showToast({
                                title: '删除失败！',
                            })
                        }
                    })
                }
            }
        })
    },

    //获取更多订单记录
    orderMore() {
        var that = this;
        if (that.data.nomore || that.data.orderList.length < 20) {
            return false
        }
        var page = that.data.orderPage + 1;
        db.collection('publish').orderBy('creatTime', 'desc').skip(page * 20).get({
            success(res) {
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
                    orderList: that.data.orderList.concat(res.data)
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

    //获取书评
    reviewList() {
        var that = this;
        db.collection('review').orderBy('creatTime', 'desc').get({
            success(res) {
                console.log(res.data);
                that.setData({
                    reviewList: res.data
                })
            }
        })
    },

    //获取更多书评
    reviewMore() {
        var that = this;
        if (that.data.nomore || that.data.reviewList.length < 20) {
            return false
        }
        var page = that.data.reviewPage + 1;
        db.collection('review').skip(page * 20).get({
            success(res) {
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
                    reviewList: that.data.reviewList.concat(res.data)
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

    //删除书评
    deleteReview(e) {
        var that = this;
        wx.showModal({
            title: '温馨提示',
            content: '确认要删除该书评吗？',
            success(res) {
                if (res.confirm) {
                    wx.showLoading({
                        title: '正在删除...',
                    })
                    //console.log(e.currentTarget.dataset.id)
                    db.collection('review').doc(e.currentTarget.dataset.id).remove({
                        success(res) {
                            console.log(res);
                            console.log('删除书评成功！');
                            wx.hideLoading({});
                            wx.showToast({
                                title: '删除书评成功！',
                            });
                            that.reviewList();
                        },
                        fail(err) {
                            console.log(err);
                            console.log('删除失败！');
                            wx.hideLoading({});
                            wx.showToast({
                                title: '删除失败！',
                            })
                        }
                    })
                }
            }
        })
    },

    //获取求购信息
    reqBookList() {
        var that = this;
        db.collection('reqBook').orderBy('creatTime', 'desc').get({
            success(res) {
                console.log(res.data);
                that.setData({
                    reqBookList: res.data
                })
            }
        })
    },

    //获取更多书评
    reqBookMore() {
        var that = this;
        if (that.data.nomore || that.data.reqBookList.length < 20) {
            return false
        }
        var page = that.data.reqBookPage + 1;
        db.collection('review').skip(page * 20).get({
            success(res) {
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
                    reqBookList: that.data.reqBookList.concat(res.data)
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

    //删除求购信息
    deleteReq(e) {
        var that = this;
        wx.showModal({
            title: '温馨提示',
            content: '确认要删除该求购吗？',
            success(res) {
                if (res.confirm) {
                    wx.showLoading({
                        title: '正在删除...',
                    })
                    //console.log(e.currentTarget.dataset.id)
                    db.collection('reqBook').doc(e.currentTarget.dataset.id).remove({
                        success(res) {
                            console.log(res);
                            console.log('删除求购成功！');
                            wx.hideLoading({});
                            wx.showToast({
                                title: '删除求购成功！',
                            });
                            that.reqBookList();
                        },
                        fail(err) {
                            console.log(err);
                            console.log('删除失败！');
                            wx.hideLoading({});
                            wx.showToast({
                                title: '删除失败！',
                            })
                        }
                    })
                }
            }
        })
    }

})
