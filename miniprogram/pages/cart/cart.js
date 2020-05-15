// miniprogram/pages/cart/cart.js
var app = getApp();
var db = wx.cloud.database();
var common = require("../../common.js");
var _ = db.command;

Page({

    /**
     * 页面的初始数据
     */
    data: {
        cart: [],
        iscart: false,
        totalPrice: 0, // 总价，初始为0
        selectAllStatus: false, // 全选状态，默认非全选

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

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getCart()
    },

    getCart() {
        var that = this;
        var arr = wx.getStorageSync('cart') || [];
        console.log(arr);
        that.setData({
            cart: arr
        });
        if (that.data.cart.length != 0) {
            that.setData({
                iscart: true
            })
        }
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        this.getCart()
    },

    //到书籍详情页
    detail(e) {
        wx.navigateTo({
            url: '/pages/detail/detail?scene=' + e.currentTarget.dataset.id,
        })
    },

    //下拉刷新
    onPullDownRefresh() {
        this.getCart();
        wx.stopPullDownRefresh({})
    },

    //选中商品
    selectList(e) {
        var index = Number(e.currentTarget.dataset.index);
        var cart = this.data.cart;
        var selected = cart[index].selected;

        cart[index].selected = !selected;

        this.setData({
            cart: cart,

        });
        this.getTotalPrice();
    },

    getTotalPrice() {
        var cart = this.data.cart; // 获取购物车列表
        var total = 0;
        for (var i = 0; i < cart.length; i++) { // 循环列表得到每个数据
            if (cart[i].selected) { // 判断选中才会计算价格
                total += Number(cart[i].sellPrice);
                //console.log(cart[i].bookinfo)// 所有价格加起来
            }
        }
        this.setData({ // 最后赋值到data中渲染到页面
            cart: cart,
            totalPrice: total
        });
    },

    //商品全选
    selectAll(e) {
        var selectAllStatus = this.data.selectAllStatus;
        selectAllStatus = !selectAllStatus;
        var cart = this.data.cart;

        for (var i = 0; i < cart.length; i++) {
            cart[i].selected = selectAllStatus;
        }
        this.setData({
            selectAllStatus: selectAllStatus,
            cart: cart
        });
        this.getTotalPrice();
    },

    //删除商品
    deleteList(e) {
        var index = e.currentTarget.dataset.index;
        var cart = this.data.cart;
        //wx.clearStorageSync()

        cart.splice(index, 1);
        wx.setStorageSync('cart', cart)
        console.log(this.data.cart)
        this.setData({
            cart: cart
        });
        if (!cart.length) {
            this.setData({
                iscart: false
            });
        } else {
            this.getTotalPrice();
        }
    },


    //获取卖家信息
    getSeller(m) {
        var that = this;
        db.collection('user').where({
            _openid: m
        }).get({
            success: function (res) {
                that.setData({
                    selluserinfo: res.data[0],
                    buyuserinfo: app.globalData.userInfo
                })
                console.log(that.data.selluserinfo)
                console.log(that.data.buyuserinfo)
                setTimeout(function () {
                    that.checkBuyway();
                }, 500)
            }
        })
    },
    //跳转付款
    confimBuy(e) {
        var that = this;
        // var index = e.currentTarget.dataset.index;
        var cart = that.data.cart; // 获取购物车列表
        if (that.data.totalPrice == 0) {
            wx.showToast({
                title: '请先选择商品！',
            })
            return false;
        }
        for (var i = 0; i < cart.length; i++) { // 循环列表得到每个数据
            if (cart[i].selected) { // 判断选中才会计算价格
                //total += Number(cart[i].sellPrice); 
                console.log(cart[i]) // 所有价格加起来

                that.setData({
                    showBuy: true,
                    publishinfo: cart[i],
                    bookinfo: cart[i].bookinfo,
                    deleteId: i
                });
                that.getSeller(cart[i]._openid)





            }
        }


    },

    //自动选择
    checkBuyway() {
        var that = this;
        var sellCampus = that.data.selluserinfo.campus.id;
        var buyCampus = that.data.buyuserinfo.campus.id;
        console.log(sellCampus)
        console.log(buyCampus)
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
                that.history('购买书籍', price, 2, e._id);
                that.complete();
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
                        //that.sms();
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

    //支付完成后从购物车删除该商品
    complete() {
        var that = this;
        var index = that.data.deleteId;
        var cart = that.data.cart;

        cart.splice(index, 1);
        wx.setStorageSync('cart', cart)
        this.setData({
            cart: cart
        });
        if (!cart.length) {
            this.setData({
                iscart: false
            });
        } else {
            this.getTotalPrice();
        }
    },


    //关闭购买弹窗
    closeBuy() {
        this.setData({
            showBuy: false
        })
    },
})