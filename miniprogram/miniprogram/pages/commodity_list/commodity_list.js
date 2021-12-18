const app = getApp()
const api = require("../../api/api")
const cache = require("../../cache/cache")
const MAX_COMMODITY_LIMIT_SIZE = 10
let res = {}
let params = {}
let uid = 0
let cid = -1
let start = 0
let categories = [{
  name: "全部",
  cid: -1
}]
let currCategory = ""

Page({

  /**
   * 页面的初始数据
   */
  data: {
    showLoginPopup: false,
    pageIndex: 0,
    searchInput:"",
    universityName: "",
    commodityList: [],
    categoryName: [],
    start: 0,
    isLoading: false,
    hasMore: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {

    wx.showLoading({
      title: '加载中',
    })

    // 获取我的信息和大学信息
    const registered = app.globalData.registered
    let myInfoAndMyUniversityInfo = {}
    if(registered){
      res = await cache.getMyInfoAndMyUniversityInfo()
      myInfoAndMyUniversityInfo = res.data
    }else{
      myInfoAndMyUniversityInfo = {
        "uid": parseInt(options.uid),
        "universityInfo": {
          "name": "注册后可选择大学"
        }
      }
    }
    
    uid = myInfoAndMyUniversityInfo.uid
    cid = -1
    

    // 获取分类信息
    categories = [{
      name: "全部",
      cid: -1,
    }]
    res = await cache.getCommodityCategory()
    if(res.errno == -1){
      console.log("获取商品分类信息失败！")
      return
    }
    const commodityCategory = res.data
    // 渲染分类tab
    for(let i = 0;i < commodityCategory.length;i++){
      categories.push({
        name:commodityCategory[i].name,
        cid: commodityCategory[i].cid
      })
    }

    // 获取商品列表
    start = 0
    params = {
      uid,
      cid,
      keyword: "",
      start: start,
      count: MAX_COMMODITY_LIMIT_SIZE,
      is_mine: false
    }
    res = await cache.getCommodityListByUidAndCid(params)
    if(res.errno == -1){
      console.log("获取商品列表失败！")
      return
    }
    let commodityList = res.data
    start = commodityList.length

    let categoryInfo = categories.map(function(item){
      return {
        "name": item.name,
      }
    })

    currCategory = categoryInfo[0].name
    this.setData({
      commodityList,
      currCategory,
      universityName: myInfoAndMyUniversityInfo.universityInfo.name
    })    
    wx.hideLoading()
  },

  async onShow(){
    
    wx.showLoading({
      title: '加载中',
    })

    // 获取我的信息和大学信息
    const registered = app.globalData.registered
    let myInfoAndMyUniversityInfo = {}
    if(registered){
      res = await cache.getMyInfoAndMyUniversityInfo()
      myInfoAndMyUniversityInfo = res.data
    }else{
      myInfoAndMyUniversityInfo = {
        "uid": parseInt(options.uid),
        "universityInfo": {
          "name": "注册后可选择大学"
        }
      }
    }
    
    uid = myInfoAndMyUniversityInfo.uid
    cid = -1
    
    // 获取分类信息
    categories = [{
      name: "全部",
      cid: -1
    }]
    res = await cache.getCommodityCategory()
    if(res.errno == -1){
      console.log("获取商品分类信息失败！")
      return
    }
    const commodityCategory = res.data
    // 渲染分类tab
    for(let i = 0;i < commodityCategory.length;i++){
      categories.push({
        name:commodityCategory[i].name,
        cid: commodityCategory[i].cid
      })
    }

    // 获取商品列表
    start = 0
    params = {
      uid,
      cid,
      keyword: "",
      start: start,
      count: MAX_COMMODITY_LIMIT_SIZE,
      is_mine: false
    }
    res = await cache.getCommodityListByUidAndCid(params)
    if(res.errno == -1){
      console.log("获取商品列表失败！")
      return
    }
    let commodityList = res.data
    start = commodityList.length

    let categoryInfo = categories.map(function(item){
      return {
        "name": item.name
      }
    })
    currCategory = categoryInfo[0].name
    this.setData({
      commodityList,
      categoryInfo,
      currCategory,
      universityName: myInfoAndMyUniversityInfo.universityInfo.name
    })    
    wx.hideLoading()
  },

  // 表单
  onSearchInput(event){
    this.setData({
      searchInput: event.detail.value
    })
  },

  // 搜索
  async onSearchCommodity(event){
    const keyword = event.detail.value
    wx.navigateTo({
      url: `../commodity_search/commodity_search?keyword=${keyword}`,
    })
  },

  // 标签页，切换分类
  async tabSelect(e) {
    wx.showLoading({
      title: '加载中',
    })
    const idx = e.currentTarget.dataset.id
    currCategory = this.data.categoryInfo[idx].name,
    this.setData({
      // TabCur: e.currentTarget.dataset.id,
      // scrollLeft: (e.currentTarget.dataset.id-1)*60,
      commodityList: [],
      currCategory,
    })
    cid = categories[idx].cid
    start = 0

    // 获取商品列表
    params = {
      uid,
      cid,
      keyword: "",
      start: start,
      count: MAX_COMMODITY_LIMIT_SIZE,
      is_mine: false
    }
    res = await cache.getCommodityListByUidAndCid(params)
    if(res.errno == -1){
      console.log("获取商品列表失败！")
      return
    }
    const commodityList = res.data
    start = commodityList.length
    this.setData({
      commodityList,
      hasMore: true,
      isLoading: false
    })    
    wx.hideLoading()
  },

  // 轮播图相关 cardSwiper
  // cardSwiper(e) {
  //   this.setData({
  //     cardCur: e.detail.current
  //   })
  // },

  // 刷新商品列表
  async onPullDownRefresh() {

    wx.showLoading({
      title: '加载中',
    })

    params = {
      uid,
      cid,
      keyword: "",
      start: 0,
      count: MAX_COMMODITY_LIMIT_SIZE,
      is_mine: false
    }
    res = await api.getCommodityListByUidAndCid(params)
    if(res.errno == -1){
      console.log("刷新商品列表失败！")
      return
    }
    const commodityList = res.data
    start = commodityList.length

    params = {
      cid,
      commodityList
    }
    res = await cache.setCommodityListByCid(params)
    if(res.errno == -1){
      console.log("新数据写入缓存失败")
      return
    }
    this.setData({
      commodityList,
      hasMore: true,
      isLoading: false
    })  
    wx.stopPullDownRefresh()
    wx.hideLoading()
  },

  // 到底加载更多数据
  async onReachBottom() {

    if(!this.data.hasMore){
      return
    }
    this.setData({
      isLoading: true
    })

    params = {
      uid,
      cid,
      keyword: "",
      start: start,
      count: MAX_COMMODITY_LIMIT_SIZE,
      is_mine: false
    }
    res = await api.getCommodityListByUidAndCid(params)
    if(res.errno == -1){
      console.log("加载更多商品列表失败！")
      return
    }
    const moreCommodityList = res.data
    if(moreCommodityList.length == 0){
      console.log("没有更多数据了！")
      this.setData({
        isLoading:false,
        hasMore: false
      })
      return
    }
    start += moreCommodityList.length
    const newCommodityList = this.data.commodityList.concat(moreCommodityList)
    params = {
      cid,
      commodityList: newCommodityList
    }
    res = await cache.setCommodityListByCid(params)
    if(res.errno == -1){
      console.log("新数据写入缓存失败")
      return
    }
    this.setData({
      commodityList: newCommodityList
    })  

  },


  async onEnterCommodityDetail(event){
    const id = event.currentTarget.dataset.id
    console.log("点击商品的信息",event.currentTarget.dataset)
    wx.navigateTo({
      url: `../commodity_detail/commodity_detail?id=${id}&enteredFrom=1`,
    })
  },


  //底部Tab相关
  async onCommodityReleaseTab(){
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

  async onHomeTab(){
    wx.redirectTo({
      url: '../home/home',
    })
  },

  onShowLoginPopup(){
    const registered = app.globalData.registered
    if(!registered){
      this.setData({
        showLoginPopup: true
      })
    }
  },

  onCancelLoginPopup(){
    this.setData({
      showLoginPopup: false
    })
  },

    // 用户注册
    async onAuth(){
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