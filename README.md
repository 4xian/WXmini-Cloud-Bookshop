# 二手闲置书店

# 小程序主要功能有：
注册登录，扫码发表书籍，商品详情，商品搜索，加购物车，购物车管理，下单支付，发布书评，发布求购书籍，书籍租借，余额提现，我的发布，我的订单

# 管理员功能：
用户管理，在售管理，书圈管理，订单管理，数据统计

# 数据统计：
主要有注册男女比例统计，订单在售情况统计，发布种类统计，数据统计借助Echart.js实现.

1.小程序端

下载导入到微信开发者工具，appid填写自己的


2.云环境

首先开通云开发，可选免费版，然后在数据库添加下列集合：

![图片](https://github.com/4xian/WXmini-Cloud-Bookshop/blob/master/Img/addDB.png)

切换到云开发目录，在安装node，npm环境后,通过npm install安装所需依赖，并且每个云函数进行上传并部署：

![图片](https://github.com/4xian/WXmini-Cloud-Bookshop/blob/master/Img/uploadFn.png)

其他短信配置和支付配置相关的，去对应的云函数的index中进行配置，都有具体注释：
短信用的是腾讯云免费短信
