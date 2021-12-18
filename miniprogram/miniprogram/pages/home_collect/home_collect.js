// miniprogram/pages/home_release/home_release.js
const MAX_COMMODITY_LIMIT_SIZE = 5
const api = require('../../api/api')
const cache = require('../../cache/cache')
let res = {}
let params = {}
let Collection = []
let start = 0
let uid = ""


Page({

  /**
   * 页面的初始数据
   */
  data: {
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
    // 获取收藏商品_id
    res = await api.getCollectionInfo()
    if (res.errno == -1) {
      console.log("获取收藏商品_id失败！")
      return
    }
    const CollectionInfo = res.data
    console.log({
      "收藏商品_id": CollectionInfo
    })

    //开始加载收藏列表
    var i = 0
    for (i = 0; i < CollectionInfo.length; i++) {
      Collection[i] = CollectionInfo[i].commodity_id
    }
    start = 0
    params = {
      Collection,
      start: start,
      count: MAX_COMMODITY_LIMIT_SIZE,
    }
    console.log({
      "已收藏的商品ID": Collection
    })
    res = await api.getCollectionListBy_id(params)
    if (res.errno == -1) {
      console.log("获取我收藏的商品信息失败！")
      return
    }
    const CollectionList = res.data
    start = CollectionList.length
    this.setData({
      CollectionList
    })
    console.log({
      "已收藏的商品信息": CollectionList
    })
    wx.hideLoading()

  },

  async onShow() {
    wx.showLoading({
      title: '加载中',
    })
    // 获取收藏商品_id
    res = await api.getCollectionInfo()
    if (res.errno == -1) {
      console.log("获取收藏商品_id失败！")
      return
    }
    const CollectionInfo = res.data
    console.log({
      "收藏商品_id": CollectionInfo
    })

    //开始加载收藏列表
    var i = 0
    for (i = 0; i < CollectionInfo.length; i++) {
      Collection[i] = CollectionInfo[i].commodity_id
    }
    start = 0
    params = {
      Collection,
      start: start,
      count: MAX_COMMODITY_LIMIT_SIZE,
    }
    console.log({
      "已收藏的商品ID": Collection
    })
    res = await api.getCollectionListBy_id(params)
    if (res.errno == -1) {
      console.log("获取我收藏的商品信息失败！")
      return
    }
    const CollectionList = res.data
    start = CollectionList.length
    this.setData({
      CollectionList
    })
    console.log({
      "已收藏的商品信息": CollectionList
    })
    wx.hideLoading()
  },

  // 加载更多
  async onReachBottom() {
    if (!this.data.hasMore) {
      return
    }
    this.setData({
      isLoading: true
    })

    params = {
      Collection,
      keyword: "",
      start: start,
      count: MAX_COMMODITY_LIMIT_SIZE,
    }
    res = await api.getCollectionListBy_id(params)
    if (res.errno == -1) {
      console.log("加载更多商品列表失败！")
      return
    }
    const moreCollectionList = res.data
    if (moreCollectionList.length == 0) {
      console.log("没有更多数据了！")
      this.setData({
        isLoading: false,
        hasMore: false
      })
      return
    }
    start += moreCollectionList.length
    const newCollectionList = this.data.CollectionList.concat(moreCollectionList)

    this.setData({
      CollectionList: newCollectionList
    })

  },

  onNavigateBack() {
    Collection = []
    wx.navigateBack({
      delta: 1
    })
  },

  onEnterCommodityDetail(event) {
    Collection = []
    const id = event.currentTarget.dataset.id
    wx.navigateTo({
      url: `../commodity_detail/commodity_detail?id=${id}&enteredFrom=1`,
    })
  },

})