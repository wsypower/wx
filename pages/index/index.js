import axios from "../../miniprogram_npm/wx-mini-program-axios/index.js";
//index.js
//获取应用实例
const app = getApp();
Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    motto: "Hello World",
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse("button.open-type.getUserInfo")
  },
  //触发tab事件
  onMyEvent: function(e) {
    console.log(e); // 自定义组件触发事件时提供的detail对象
  },
  //事件处理函数
  bindViewTap() {
    wx.navigateTo({
      url: "../logs/logs"
    });
  },
  onLoad() {
    axios
      .post("http://lfyy.vipgz5.idcfengye.com/api/haircut/getInitData")
      .then(function(response) {
        console.log(111);
        console.log(response);
      })
      .catch(function(error) {
        console.log(123);
        console.log(error);
      });
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      });
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        });
      };
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo;
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          });
        }
      });
    }
  },
  getUserInfo(e) {
    console.log(e);
    app.globalData.userInfo = e.detail.userInfo;
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    });
  }
});
