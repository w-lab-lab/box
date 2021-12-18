// miniprogram/pages/commodity_detail/commodity_detail.js
import Dialog from '@vant/weapp/dialog/dialog';
const app = getApp()
const api = require('../../api/api')
const cache = require("../../cache/cache")
const rules = require('../../utils/rules')
const {RespSuccess, RespError} = require('../../utils/resp')
let res = {}
let params = {}
let opts = {}
let commodityDetail = {}
let commodity_id = ""
let categories = []
let cid = 0
let uid = 0
let newthumbnail = []
let delImg = []
let uploadImg = []
let newcommodityImg = []
let neworicommodityImg = []
let orithumbnail = []
let oricommodityImg = []

Page({
  data: {
    thumbnail: [],
    commodityImg: [],
    commodityNumber: 1,
    categoryIndex: 0,
    commodityTitle: "",
    commodityContent:"",
    commodityPurchaseUrl:"",
    commodityOriginPrice:"",
    commodityCurrentPrice:"",
    commodityRemark:"",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {

    wx.showLoading({
      title: '加载中',
    })

    // 读取商品分类信息
    categories = []
    res = await cache.getCommodityCategory()
    if(res.errno == -1){
      console.log("获取商品分类信息失败")
    }else{
      // 分类信息渲染
      const commodityCategory = res.data
      for(let i = 0;i < commodityCategory.length;i++){
        const name = commodityCategory[i].name
        const cid = commodityCategory[i].cid
        categories.push({
          name,
          cid
        })
      }
      cid = categories[0].cid
      this.setData({
        categories
      })
    }

    // 获取我的信息和大学信息
    let myInfoAndMyUniversityInfo = {}
    if(registered){
      res = await cache.getMyInfoAndMyUniversityInfo()
      if(res.errno == -1){
        console.log("获取我的信息和大学信息失败！")
        return
      }
      myInfoAndMyUniversityInfo = res.data
    }else{
      myInfoAndMyUniversityInfo = {
        "openid": -1
      }
    }
    
    const myUserId = myInfoAndMyUniversityInfo.openid
    

    const registered = app.globalData.registered

    opts = options

    
    // 获取商品详情信息
    commodity_id = opts.id
    params = {
      id: commodity_id
    }
    res = await api.getCommodityDetail(params)
    if(res.errno == -1){
      wx.hideLoading()
      console.log("商品详情获取失败！")
      Dialog.alert({
        title: '出错了！',
        message:res.message,
      }).then(() => {
        wx.navigateBack()
      })
      return
    }
    commodityDetail = res.data
    this.setData({
      thumbnail: commodityDetail.thumbnail_url,
      commodityImg: commodityDetail.img_url,
      commodityNumber: commodityDetail.number,
      categoryIndex: commodityDetail.cid,
      commodityTitle: commodityDetail.title,
      commodityContent:commodityDetail.content,
      commodityPurchaseUrl:commodityDetail.origin_url,
      commodityOriginPrice:commodityDetail.price_origin,
      commodityCurrentPrice:commodityDetail.price_now,
      commodityRemark:commodityDetail.remark,
    })
    console.log("更新oricommodityImg")
    orithumbnail = this.data.thumbnail
    oricommodityImg = this.data.commodityImg
    oricommodityImg = oricommodityImg.concat("null")
    console.log(orithumbnail)
    console.log(oricommodityImg)
    console.log(commodityDetail)
    wx.hideLoading()
  },

  onNavigateBack(){
    wx.navigateBack({
      delta: 1,
    })
  },

  // 表单
  onChangeCommodityTitle(event){
    this.setData({
      commodityTitle: event.detail.value
    })
  },
  onChangeCommodityContent(event){
    this.setData({
      commodityContent: event.detail.value
    })
  },
  onChangeCommodityOriginPrice(event){
    this.setData({
      commodityOriginPrice: event.detail.value
    })
  },
  onChangeCommodityCurrentPrice(event){
    this.setData({
      commodityCurrentPrice: event.detail.value
    })
  },
  onChangeCommodityPurchaseUrl(event){
    this.setData({
      commodityPurchaseUrl: event.detail.value
    })
  },
  onChangeCommodityRemark(event){
    this.setData({
      commodityRemark: event.detail.value
    })
  },
  onChangeCommodityNumber(event){
    console.log(event.detail.value)
    this.setData({
      commodityNumber: event.detail.value
    })
  },
  onChangeCommodityCategory(event){
    const idx = event.detail.value
    cid = categories[idx].cid
    this.setData({
      categoryIndex: idx
    })
  },

  // 添加缩略图
  onUpdateThumbnail(e) {
    wx.chooseImage({
      count: 1, //默认9
      sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album','camera'], //从相册选择
      success: (res) => {
        if (this.data.thumbnail.length != 0) {
          this.setData({
            thumbnail: this.data.thumbnail.concat(res.tempFilePaths)
          })
        } else {
          this.setData({
            thumbnail: res.tempFilePaths
          })
        }
      }
    });
  },
  onViewThumbnail(e) {
    wx.previewImage({
      urls: this.data.thumbnail,
      current: e.currentTarget.dataset.url
    });
  },
  onDelThumbnail(e) {
    this.data.thumbnail.splice(e.currentTarget.dataset.index, 1);
    this.setData({
      thumbnail: this.data.thumbnail
    })
  },

  // 添加详情图
  onUpdateCommodityImg(e) {
    wx.chooseImage({
      count: 9, //默认9
      sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album'], //从相册选择
      success: (res) => {
        if (this.data.commodityImg.length != 0) {
          this.setData({
            commodityImg: this.data.commodityImg.concat(res.tempFilePaths)
          })
        } else {
          this.setData({
            commodityImg: res.tempFilePaths
          })
        }
      }
    });
  },
  onViewCommodityImg(e) {
    wx.previewImage({
      urls: this.data.commodityImg,
      current: e.currentTarget.dataset.url
    });
  },
  onDelCommodityImg(e) {
    this.data.commodityImg.splice(e.currentTarget.dataset.index, 1)
    this.setData({
      commodityImg: this.data.commodityImg
    })
  },

  // 验证表单格式
  isValid(params){
    console.log(params)
    if(!rules.required(params.title)){
      return new RespError("商品名称不能为空！")
    }
    if(!rules.required(params.number)){
      return new RespError("商品数量不能为空！")
    }
    if(!rules.required(params.price_origin)){
      return new RespError("商品原价不能为空！")
    }
    if(!rules.required(params.price_now)){
      return new RespError("商品现价不能为空！")
    }
    if(!rules.required(params.content)){
      return new RespError("商品详情不能为空！")
    }
    if(!rules.onlyNumber(params.number)){
      return new RespError("商品数量必须是数字")
    }
    if(!rules.onlyNumber(params.price_origin)){
      return new RespError("商品原价必须是数字")
    }
    if(!rules.onlyNumber(params.price_now)){
      return new RespError("商品现价必须是数字")
    }
    if(params.number < 1){
      return new RespError("商品数量至少为1")
    }
    if(params.price_origin < 0){
      return new RespError("商品原价至少为0")
    }
    if(params.price_now < 0){
      return new RespError("商品现价至少为0")
    }
    return new RespSuccess()
  },

  
  // 上传商品信息
  async onCommodityRelease(){ 
        res = await cache.getMyInfoAndMyUniversityInfo()
        if(res.errno == -1){
          console.log("获取我的信息和我的大学信息失败！")
        }
        console.log(res)
        const myInfoAndMyUniversityInfo = res.data
        const userPrimaryKey = myInfoAndMyUniversityInfo._id
        uid = myInfoAndMyUniversityInfo.uid
        let uploadParams = {
          _id: commodity_id,
          cid: cid,
          content: this.data.commodityContent,
          title: this.data.commodityTitle,
          number: parseInt(this.data.commodityNumber),            
          origin_url: this.data.commodityPurchaseUrl?this.data.commodityPurchaseUrl:"",
          price_origin: parseFloat(this.data.commodityOriginPrice),
          price_now: parseFloat(this.data.commodityCurrentPrice),
          remark: this.data.commodityRemark?this.data.commodityRemark:"",
          uid: uid,
          thumbnail_url: orithumbnail,
          img_url: oricommodityImg,
        }
        res = this.isValid(uploadParams)
        
        if(res.errno == -1){
          Dialog.alert({
            title: '格式错误',
            message:res.message,
          })
          return
        }
        
        // 上传图片到云存储，获取fileId
        if(this.data.thumbnail.length == 0 || this.data.commodityImg.length == 0){
          wx.hideLoading()
          Dialog.alert({
            title: '格式错误',
            message:"至少上传一张缩略图和一张详情图！",
          })
          return
        }

        wx.showLoading({
          title: '上传中',
        })

        if(this.data.thumbnail[0] != orithumbnail[0]) {
          console.log("更新新缩略图")
          params = {
            fileIDs: orithumbnail
          }
          res = await api.delImg(params)

          params = {
            thumbnail:this.data.thumbnail
          }
          res = await api.uploadImgAndGetFileID(params)
          if(res.errno != 0){
            wx.hideLoading()
            console.log("上传新缩略图失败！")
            wx.showToast({
              title: res.message,
              icon: 'none',
              duration: 2000,
              success(res){
                setTimeout(() => {
                }, 1500)
              }
            })
            return
          }


          newthumbnail = res.data

        }else{
          newthumbnail = orithumbnail
        }

        delImg = oricommodityImg.filter(x => this.data.commodityImg.indexOf(x) == -1)
        neworicommodityImg = oricommodityImg.filter(x => delImg.indexOf(x) == -1)
        uploadImg = this.data.commodityImg.filter(x => oricommodityImg.indexOf(x) == -1)

        if(delImg.length > 0) {
          params = {
            fileIDs: delImg
          }
          console.log("删除图片地址")
          console.log(params)
          res = await api.delImg(params)
          newcommodityImg = neworicommodityImg
        }
          
        if (uploadImg.length > 0) {
          params = {
            commodityImg:uploadImg
          }
          console.log("上传新图片")
          res = await api.uploadImgAndGetFileID(params)
          if(res.errno != 0){
            wx.hideLoading()
            console.log("上传信息失败！")
            wx.showToast({
            title: res.message,
            icon: 'none',
            duration: 2000,
              success(res){
                setTimeout(() => {
                }, 1500)
              }
            })
            return
          }
          newcommodityImg = neworicommodityImg.concat(res.data)
        } else {
          console.log("不上传新的")
          newcommodityImg = neworicommodityImg
        }
          

        uploadParams["thumbnail_url"] = newthumbnail
        uploadParams["img_url"] = newcommodityImg

        res = await api.uploadCommodityDetail(uploadParams)
        if(res.errno != 0){
          wx.hideLoading()
          console.log("上传信息失败！")
          wx.showToast({
            title: res.message,
            icon: 'none',
            duration: 2000,
            success(res){
              setTimeout(() => {
              }, 1500)
            }
          })
        }else {
          // 清空缓存
          wx.clearStorageSync()
          wx.hideLoading()
    
          wx.showToast({
            title: '上传成功！',
            icon: 'success',
            duration: 2000,
            success(res){
              setTimeout(() => {
                wx.redirectTo({
                  url: `../home/home`
                })
              }, 1000)
            }
          })
        }
  },

  onCancelLoginPopup(){
    this.setData({
      showLoginPopup: false
    })
  },

  //删除商品
  async onDelCommodity(){
      Dialog.confirm({
        message: '确定删除吗？'
      })
      .then(async () => {
        wx.showLoading({
          title: '请耐心等待',
        })
        params = {
          commodity_id: commodity_id
        }
        res = await api.delCommodity(params)
        if(res.errno == -1){
          wx.hideLoading()
          Dialog.alert({
            title: '出错了！',
            message:res.message,
          })
        }else if(res.errno == -2){
          wx.hideLoading()
          Dialog.alert({
            title: '出错了！',
            message:res.message,
          })
        }else{
          wx.hideLoading()
          cache.clearCommodityList()
          console.log("成功返回")
          wx.navigateBack({
            delta: 1,
          })
        }
      })
  }
})