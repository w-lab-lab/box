// miniprogram/pages/home/home.js
const app = getApp()
const api = require('../../api/api')
const cache = require('../../cache/cache')
import Dialog from '@vant/weapp/dialog/dialog';
let res = {}
let params = {}
let userid = ""
let start = 0
let room = []
let roomidList = []
Page({

  /**
   * 页面的初始数据
   */
  data: {
    newMsg:false,
    pageIndex: 1,
    homepicsrcs:[
      {src:"https://7778-wxapp1-2gyuivu17f31ebac-1305836354.tcb.qcloud.la/homepic/payrecord.png?sign=c1d64e2da1c089a952c9ba1b3cb5c325&t=1620780679"},
      {src:"https://7778-wxapp1-2gyuivu17f31ebac-1305836354.tcb.qcloud.la/homepic/sells.png?sign=ec11a32dad1624b1b201b1d995184cdf&t=1620780698"},
      {src:"https://7778-wxapp1-2gyuivu17f31ebac-1305836354.tcb.qcloud.la/homepic/collections.png?sign=f981ce15be0a40e9c2514b618bbb69ee&t=1620780709"}
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    // 获取我的信息和大学信息
    const registered = app.globalData.registered
    let myInfoAndMyUniversityInfo = {}
    if(registered){
      res = await cache.getMyInfoAndMyUniversityInfo()
      myInfoAndMyUniversityInfo = res.data
      res = cache.setMyInfoAndMyUniversityInfo({myInfoAndMyUniversityInfo})
      if(res.errno == -1){
        console.log("更新我的信息和大学信息缓存失败！")
      }
      userid = myInfoAndMyUniversityInfo.openid
      start = 0
      //获取作为买家身份的所有房间号
      params = {
        id: userid,
        start: start,
        count: 50
      }
      res = await api.getRoomByBuyer(params)
        if (res.errno == -1) {
          console.log("获取房间信息失败")
          return
        }
      room = res.data
      for (let i = 0; i < room.length; i++) {
        roomidList = roomidList.concat(room[i]._id)
      } 
      room = []
      res = await api.getRoomBySeller(params)
        if (res.errno == -1) {
          console.log("获取房间信息失败")
          return
        }
      room = res.data
      for (let i = 0; i < room.length; i++) {
        roomidList = roomidList.concat(room[i]._id)
      }
      params = {
        userid:userid,
        roomidList: roomidList,
        start: 0,
        count: 1
      }
      res = await api.getNewMsgByRoomId(params)
      console.log("最新的一条消息：",res)
      this.setData({
        newMsg:!res.data[0].is_read
      })
    }else{
      myInfoAndMyUniversityInfo = {
        "avatar_url": "https://6472-dreamland2-a708ef-1259161827.tcb.qcloud.la/bg-image/default-avatar.PNG?sign=a081b590e23599cb28b39dcc12cd5f79&t=1603671410",
        "name": "未注册",
        "universityInfo":{
          "name": "注册后可选择大学"
        },
        "total_transaction": 0,
        "total_release": 0
      }
    }

    const userAvatarUrl = myInfoAndMyUniversityInfo.avatar_url
    const userName = myInfoAndMyUniversityInfo.name
    const universityName = myInfoAndMyUniversityInfo.universityInfo.name
    const totalTransaction = myInfoAndMyUniversityInfo.total_transaction
    const totalRelease = myInfoAndMyUniversityInfo.total_release
    this.setData({
      userAvatarUrl,
      userName,
      universityName,
      totalTransaction,
      totalRelease
    })
  },

  async onShow() {
    // 获取我的信息和大学信息
    const registered = app.globalData.registered
    let myInfoAndMyUniversityInfo = {}
    if(registered){
      res = await cache.getMyInfoAndMyUniversityInfo()
      myInfoAndMyUniversityInfo = res.data
      res = cache.setMyInfoAndMyUniversityInfo({myInfoAndMyUniversityInfo})
      if(res.errno == -1){
        console.log("更新我的信息和大学信息缓存失败！")
      }
      userid = myInfoAndMyUniversityInfo.openid
      start = 0
      //获取作为买家身份的所有房间号
      params = {
        id: userid,
        start: start,
        count: 50
      }
      res = await api.getRoomByBuyer(params)
        if (res.errno == -1) {
          console.log("获取房间信息失败")
          return
        }
      room = res.data
      for (let i = 0; i < room.length; i++) {
        roomidList = roomidList.concat(room[i]._id)
      } 
      room = []
      res = await api.getRoomBySeller(params)
        if (res.errno == -1) {
          console.log("获取房间信息失败")
          return
        }
      room = res.data
      for (let i = 0; i < room.length; i++) {
        roomidList = roomidList.concat(room[i]._id)
      }
      params = {
        roomidList: roomidList,
        start: 0,
        count: 1
      }
      res = await api.getNewMsgByRoomId(params)
      console.log("最新的一条消息：",res)
      this.setData({
        newMsg:!res.data[0].is_read
      })
    }else{
      myInfoAndMyUniversityInfo = {
        "avatar_url": "https://6472-dreamland2-a708ef-1259161827.tcb.qcloud.la/bg-image/default-avatar.PNG?sign=a081b590e23599cb28b39dcc12cd5f79&t=1603671410",
        "name": "未注册",
        "universityInfo":{
          "name": "注册后可选择大学"
        },
        "total_transaction": 0,
        "total_release": 0
      }
    }

    const userAvatarUrl = myInfoAndMyUniversityInfo.avatar_url
    const userName = myInfoAndMyUniversityInfo.name
    const universityName = myInfoAndMyUniversityInfo.universityInfo.name
    const totalTransaction = myInfoAndMyUniversityInfo.total_transaction
    const totalRelease = myInfoAndMyUniversityInfo.total_release
    this.setData({
      userAvatarUrl,
      userName,
      universityName,
      totalTransaction,
      totalRelease
    })
  },

  onEnterHomeUserInfo(){
    const registered = app.globalData.registered
    if(registered){
      wx.navigateTo({
        url: '../home_user_info/home_user_info',
      })
    }else{
      this.setData({
        showLoginPopup: true
      })
    }
    
  },

  onEnterHomeTransaction(){
    const registered = app.globalData.registered
    if(registered){
      wx.navigateTo({
        url: '../home_transaction/home_transaction',
      })
    }else{
      this.setData({
        showLoginPopup: true
      })
    }
    
  },


  onEnterHomeRelease(){
    const registered = app.globalData.registered
    if(registered){
      wx.navigateTo({
        url: '../home_release/home_release',
      })
    }else{
      this.setData({
        showLoginPopup: true
      })
    }
    
  },

  onEnterHomeCollect(){
    const registered = app.globalData.registered
    if(registered){
      wx.navigateTo({
        url: '../home_collect/home_collect',
      })
    }else{
      this.setData({
        showLoginPopup: true
      })
    }
  },

  onEnterChatList(){
    const registered = app.globalData.registered
    if(registered){
      wx.navigateTo({
        url: '../chatlist/chatlist',
      })
    }else{
      this.setData({
        showLoginPopup: true
      })
    }
  },

  onEnterHomeAbout(){
    wx.navigateTo({
      url: '../home_about/home_about',
    })
  },

  copyLink(e) {
    wx.setClipboardData({
      data: e.currentTarget.dataset.link,
      success: res => {
        wx.showToast({
          title: '已复制',
          duration: 1000,
        })
      }
    })
  },

  // 订阅消息：当有人购买用户发布的商品时，推送消息给此用户
  onAuthReceiveMsg(){
    const registered = app.globalData.registered
    if(!registered){
      this.setData({
        showLoginPopup: true
      })
      return
    }

    // 模板ID 需要在微信公众平台中配置
    const tmplId = 'jv0oI0ttsFe8gIZj_scuSF9mqFpmxZo_QPcPYIoPTeI'
    wx.requestSubscribeMessage({
      tmplIds: [tmplId],
      success: async (res) => {
        console.log(await wx.getSetting({
          withSubscriptions: true,
        }))
        Dialog.alert({
          message: '当您有新的交易时，将接收到一次推送。若收到后，想要继续接受推送，则需再次点击此按钮。',
          theme: 'round-button',
        })
      }
    })
  },


  onCommodityReleaseTab(){
    const registered = app.globalData.registered
    if(registered){
      wx.navigateTo({
        url: '../commodity_release/commodity_release',
      })
    }else{
      this.setData({
        showLoginPopup: true
      })
    }
  },

  onCommodityListTab(){
    wx.redirectTo({
      url: '../commodity_list/commodity_list',
    })
  },


  onCancelLoginPopup(){
    this.setData({
      showLoginPopup: false
    })
  },

    // 用户注册
    async onAuth() {
      wx.getUserProfile({
        desc: '用于完善用户个人信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
        success: (res) => {
          this.setData({
            userInfo: res.userInfo,
          })
          console.log("获取用户信息")
          console.log(this.data.userInfo)
          wx.setStorageSync('userInfo', this.data.userInfo)
        }
      })
      this.setData({
        showLoginPopup: false
      })
      wx.redirectTo({
        url: '../index_register/index_register',
      })
      
    },
})