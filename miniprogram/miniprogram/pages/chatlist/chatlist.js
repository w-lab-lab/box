const api = require('../../api/api')
const cache = require('../../cache/cache')
const utils = require('../../utils/utils')

const MAX_CHATLIST_SIZE = 10
let res = {}
let params = {}
let userid = ""
let buyerDetail = {}
let sellerDetail = {}
let room_id = ""
let start = 0
let commodity_id = ""
let sellerRoom = []
let buyerRoom = []
let moreSellerRoom = []
let moreBuyerRoom = []
let chatList = []
let watcher = {}
let roomList = []
let selecting = false
let firsttime = true

const db = wx.cloud.database({
  env: "cloud1-6g3tf8v64f9a5fc3"
})

const _ = db.command

// pages/chatlist/chatlist.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoading: false,
    hasMore: true,
    index: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  // async onLoad(options) {
  //   selecting = true
  //   wx.showLoading({
  //     title: '加载中',
  //   })
  //   chatList = []
  //   console.log("chatlist clear in show")
  //   //获得我的id
  //   res = await cache.getMyInfoAndMyUniversityInfo()
  //   if (res.errno == -1) {
  //     console.log("获取我的信息和大学信息失败！")
  //     return
  //   }
  //   userid = res.data.openid
  //   start = 0
  //   if (this.data.index == 0) {
  //     console.log("clear sellerRoom data")
  //     //获取作为买家身份的所有房间号
  //     params = {
  //       id: userid,
  //       start: start,
  //       count: MAX_CHATLIST_SIZE
  //     }
  //     console.log(start)
  //     console.log(userid)
  //     res = await api.getRoomByBuyer(params)
  //     if (res.errno == -1) {
  //       console.log("获取房间信息失败")
  //       return
  //     }
  //     buyerRoom = res.data
  //     start = buyerRoom.length
  //     console.log(buyerRoom)
  //     roomList = []
  //     for (let i = 0; i < buyerRoom.length; ++i) {
  //       //获取卖家商品名称和图片链接
  //       let commodity_id = buyerRoom[i].commodity_id
  //       let avatar_url = buyerRoom[i].seller_avatar
  //       let name = buyerRoom[i].seller_name
  //       res = await api.getCommodityDetail({
  //         id: commodity_id
  //       })
  //       if (res.errno == -1) {
  //         console.log("获取商品信息出错")
  //         return
  //       }
  //       res = res.data
  //       buyerDetail = {
  //         title: res.title,
  //         image_url: res.img_url[0],
  //         avatar_url,
  //         name
  //       }
  //       //在买家列表中获取最后一条聊天记录以及未读取的聊天记录以及时间
  //       room_id = buyerRoom[i]._id
  //       //将买家房间加入其中
  //       roomList.push(room_id)
  //       params = {
  //         room_id,
  //         start: 0,
  //         count: 10
  //       }
  //       res = await api.getChatMsgByRoomId(params)
  //       if (res.errno == -1) {
  //         console.log("获取聊天信息出错")
  //         return
  //       }
  //       res = res.data

  //       let unreadMsgCount = 0
  //       let lastContent = ""
  //       let lastContentTime = ""
  //       let threeDaysAgo = new Date().setDate(new Date().getDate() - 7)
  //       console.log({
  //         "date1": threeDaysAgo - new Date(res[0].send_time)
  //       })
  //       if (new Date(res[0].send_time).getTime() < threeDaysAgo) {
  //         await api.deleteAllMsgByRoomId(room_id)
  //         await api.deleteRoomById(room_id)
  //       }
  //       lastContent = res[0].content
  //       lastContentTime = utils.formatTime(res[0].send_time)
  //       for (let j = 0; j < res.length; ++j) {
  //         if (res[j].sender_id != userid) {
  //           if (!res[j].is_read) {
  //             unreadMsgCount++
  //           } else {
  //             break
  //           }
  //         }
  //       }

  //       buyerDetail = {
  //         ...buyerDetail,
  //         room_id,
  //         unreadMsgCount,
  //         lastContent,
  //         lastContentTime
  //       }
  //       console.log({
  //         "买家列表": buyerDetail
  //       })
  //       chatList.push(buyerDetail)
  //     }
  //     this.setData({
  //       chatList,
  //     })
  //   } 
  //   this.createRoomWatcher(roomList)
  //   wx.hideLoading()
  //   selecting = false
  //   console.log("onload end")
  // },

  async onShow() {
    selecting = true
    if(firsttime) {
      wx.showLoading({
        title: '加载中',
      })
    }
    chatList = []
    console.log("chatlist clear in show")
    //获得我的id
    res = await cache.getMyInfoAndMyUniversityInfo()
    if (res.errno == -1) {
      console.log("获取我的信息和大学信息失败！")
      return
    }
    userid = res.data.openid
    start = 0
    if (this.data.index == 0) {
      console.log("clear sellerRoom data")
      //获取作为买家身份的所有房间号
      params = {
        id: userid,
        start: start,
        count: MAX_CHATLIST_SIZE
      }
      console.log(start)
      console.log(userid)
      res = await api.getRoomByBuyer(params)
      if (res.errno == -1) {
        console.log("获取房间信息失败")
        return
      }
      buyerRoom = res.data
      start = buyerRoom.length
      console.log(buyerRoom)
      roomList = []
      for (let i = 0; i < buyerRoom.length; ++i) {
        //获取卖家商品名称和图片链接
        let commodity_id = buyerRoom[i].commodity_id
        let avatar_url = buyerRoom[i].seller_avatar
        let name = buyerRoom[i].seller_name
        res = await api.getCommodityDetail({
          id: commodity_id
        })
        if (res.errno == -1) {
          console.log("获取商品信息出错")
          return
        }
        res = res.data
        buyerDetail = {
          title: res.title,
          image_url: res.img_url[0],
          avatar_url,
          name
        }
        //在买家列表中获取最后一条聊天记录以及未读取的聊天记录以及时间
        room_id = buyerRoom[i]._id
        //将买家房间加入其中
        roomList.push(room_id)
        params = {
          room_id,
          start: 0,
          count: 10
        }
        res = await api.getChatMsgByRoomId(params)
        if (res.errno == -1) {
          console.log("获取聊天信息出错")
          return
        }
        res = res.data

        let unreadMsgCount = 0
        let lastContent = ""
        let lastContentTime = ""
        let threeDaysAgo = new Date().setDate(new Date().getDate() - 7)
        console.log({
          "date1": threeDaysAgo - new Date(res[0].send_time)
        })
        if (new Date(res[0].send_time).getTime() < threeDaysAgo) {
          await api.deleteAllMsgByRoomId(room_id)
          await api.deleteRoomById(room_id)
        }
        lastContent = res[0].content
        lastContentTime = utils.formatTime(res[0].send_time)
        for (let j = 0; j < res.length; ++j) {
          if (res[j].sender_id != userid) {
            if (!res[j].is_read) {
              unreadMsgCount++
            } else {
              break
            }
          }
        }

        buyerDetail = {
          ...buyerDetail,
          room_id,
          unreadMsgCount,
          lastContent,
          lastContentTime
        }
        console.log({
          "买家列表": buyerDetail
        })
        chatList.push(buyerDetail)
      }
      this.setData({
        chatList,
      })
    } else {
      console.log("clear buyerRoom data")
      //获取作为卖家身份的所有房间号
      params = {
        id: userid,
        start: start,
        count: MAX_CHATLIST_SIZE
      }
      res = await api.getRoomBySeller(params)
      if (res.errno == -1) {
        console.log("获取房间信息失败")
        return
      }
      sellerRoom = res.data
      start = sellerRoom.length
      roomList = []
      for (let i = 0; i < sellerRoom.length; ++i) {
        //在卖家列表中获取最后一条聊天记录以及未读取的聊天记录以及时间
        room_id = sellerRoom[i]._id
        //房间加入其中
        roomList.push(room_id)
        commodity_id = sellerRoom[i].commodity_id
        res = await api.getCommodityDetail({
          id: commodity_id
        })
        if (res.errno == -1) {
          console.log("获取商品信息出错")
          return
        }
        //获取买家的头像和昵称信息
        sellerDetail = {
          name: sellerRoom[i].buyer_name,
          avatar_url: sellerRoom[i].buyer_avatar,
          title: res.data.title
        }
        params = {
          room_id,
          start: 0,
          count: 10
        }
        res = await api.getChatMsgByRoomId(params)
        if (res.errno == -1) {
          console.log("获取聊天信息出错")
          return
        }
        res = res.data
        let unreadMsgCount = 0
        let lastContent = ""
        let lastContentTime = ""
        let threeDaysAgo = new Date().setDate(new Date().getDate() - 7)
        if (new Date(res[0].send_time).getTime() < threeDaysAgo) {
          await api.deleteAllMsgByRoomId(room_id)
          await api.deleteRoomById(room_id)
        }
        lastContent = res[0].content
        lastContentTime = utils.formatTime(res[0].send_time)
        for (let j = 0; j < res.length; ++j) {
          if (res[j].sender_id != userid) {
            if (!res[j].is_read) {
              unreadMsgCount++
            } else {
              break
            }
          }
        }

        sellerDetail = {
          ...sellerDetail,
          room_id,
          unreadMsgCount,
          lastContent,
          lastContentTime
        }
        console.log({
          "卖家列表": sellerDetail
        })
        chatList.push(sellerDetail)
      }
      this.setData({
        chatList,
      })
    }
    if (Object.keys(watcher).length == 0) {
      this.createRoomWatcher(roomList)
    }
    if(firsttime) {
      wx.hideLoading()
    }
    firsttime = false
    selecting = false
    console.log("onshow end")
  },

  async createRoomWatcher(roomList) {
    if (roomList.length == 0) {
      return
    }
    console.log(roomList + " watcher created")
    const _this = this
    watcher = await db.collection('chat_message')
      .orderBy('send_time', 'desc')
      .limit(MAX_CHATLIST_SIZE)
      .where({
        room_id: _.in(roomList),
      })
      .watch({
        onChange(snapshot) {

          if (snapshot.docChanges[0] && snapshot.docChanges[0].dataType == "add") {
            console.log("房间内最新消息变化")
            console.log(snapshot.docChanges[0].doc)
            let newLastContent = snapshot.docChanges[0].doc.content
            let newLastContentTime = utils.formatTime(snapshot.docChanges[0].doc.send_time)
            let theRoomId = snapshot.docChanges[0].doc.room_id
            for (let i = 0; i < chatList.length; ++i) {
              if (chatList[i].room_id == theRoomId) {
                chatList[i].lastContent = newLastContent
                chatList[i].lastContentTime = newLastContentTime
                chatList[i].unreadMsgCount++
                _this.setData({
                  chatList
                })
                break
              }
            }
          }
        },
        onError(err) {
          console.error('the watch closed because of error', err)
        }
      })
  },


  async onPullDownRefresh() {
    console.log("pull down action " + this.data.index)

    if (!this.data.hasMore) {
      return
    }

    this.setData({
      isLoading: true
    })

    if (this.data.index == 0) {
      console.log("pull down as buyer")
      params = {
        id: userid,
        start: start,
        count: MAX_CHATLIST_SIZE
      }
      res = await api.getRoomByBuyer(params)
      if (res.errno == -1) {
        console.log("获取房间信息失败")
        return
      }
      moreBuyerRoom = res.data
      if (moreBuyerRoom.length == 0) {
        console.log("没有更多聊天列表了")
        this.setData({
          isLoading: false,
          hasMore: false
        })
        return
      }
      if (Object.keys(watcher).length != 0) {
        console.log("监听关闭")
        watcher.close()
        watcher = {}
      }
      start += moreBuyerRoom.length
      for (let i = 0; i < moreBuyerRoom.length; ++i) {
        //获取卖家商品名称和图片链接
        let commodity_id = moreBuyerRoom[i].commodity_id
        let avatar_url = moreBuyerRoom[i].seller_avatar
        let name = moreBuyerRoom[i].seller_name
        res = await api.getCommodityDetail({
          id: commodity_id
        })
        if (res.errno == -1) {
          console.log("获取商品信息出错")
          return
        }
        res = res.data
        buyerDetail = {
          title: res.title,
          image_url: res.img_url[0],
          avatar_url: avatar_url,
          name: name
        }
        //在买家列表中获取最后一条聊天记录以及未读取的聊天记录以及时间
        room_id = moreBuyerRoom[i]._id
        roomList.push(room_id)
        params = {
          room_id,
          start: 0,
          count: 10
        }
        res = await api.getChatMsgByRoomId(params)
        if (res.errno == -1) {
          console.log("获取聊天信息出错")
          return
        }
        res = res.data
        let unreadMsgCount = 0
        let lastContent = ""
        let lastContentTime = ""
        let threeDaysAgo = new Date().setDate(new Date().getDate() - 7)
        if (new Date(res[0].send_time).getTime() < threeDaysAgo) {
          await api.deleteAllMsgByRoomId(room_id)
          await api.deleteRoomById(room_id)
        }
        lastContent = res[0].content
        lastContentTime = utils.formatTime(res[0].send_time)
        for (let j = 0; j < res.length; ++j) {
          if (res[j].sender_id != userid) {
            if (!res[j].is_read) {
              unreadMsgCount++
            } else {
              break
            }
          }
        }

        buyerDetail = {
          ...buyerDetail,
          room_id,
          unreadMsgCount,
          lastContent,
          lastContentTime
        }
        console.log({
          "买家列表": buyerDetail
        })
        chatList.push(buyerDetail)
      }
      this.setData({
        chatList: this.data.chatList.concat(chatList)
      })

    } else {
      //获取作为卖家身份的所有房间号
      console.log("pull down as seller")
      params = {
        id: userid,
        start: start,
        count: MAX_CHATLIST_SIZE
      }
      res = await api.getRoomBySeller(params)
      if (res.errno == -1) {
        console.log("获取房间信息失败")
        return
      }
      moreSellerRoom = res.data
      if (moreSellerRoom.length == 0) {
        console.log("没有更多聊天列表了！")
        this.setData({
          isLoading: false,
          hasMore: false
        })
        return
      }
      if (Object.keys(watcher).length != 0) {
        console.log("监听关闭")
        watcher.close()
        watcher = {}
      }
      start += moreSellerRoom.length
      for (let i = 0; i < moreSellerRoom.length; ++i) {
        //在卖家列表中获取最后一条聊天记录以及未读取的聊天记录以及时间
        room_id = moreSellerRoom[i]._id
        roomList.push(room_id)
        commodity_id = moreSellerRoom[i].commodity_id
        res = await api.getCommodityDetail({
          id: commodity_id
        })
        if (res.errno == -1) {
          console.log("获取商品信息出错")
          return
        }
        //获取买家的头像和昵称信息
        sellerDetail = {
          name: moreSellerRoom[i].buyer_name,
          avatar_url: moreSellerRoom[i].buyer_avatar,
          title: res.data.title
        }
        params = {
          room_id,
          start: 0,
          count: 10
        }
        res = await api.getChatMsgByRoomId(params)
        if (res.errno == -1) {
          console.log("获取聊天信息出错")
          return
        }
        res = res.data
        let unreadMsgCount = 0
        let lastContent = ""
        let lastContentTime = ""
        let threeDaysAgo = new Date().setDate(new Date().getDate() - 7)
        if (new Date(res[0].send_time).getTime() < threeDaysAgo) {
          await api.deleteAllMsgByRoomId(room_id)
          await api.deleteRoomById(room_id)
        }
        lastContent = res[0].content
        lastContentTime = utils.formatTime(res[0].send_time)
        for (let j = 0; j < res.length; ++j) {
          if (res[j].sender_id != userid) {
            if (!res[j].is_read) {
              unreadMsgCount++
            } else {
              break
            }
          }
        }

        sellerDetail = {
          ...sellerDetail,
          room_id,
          unreadMsgCount,
          lastContent,
          lastContentTime
        }
        console.log({
          "卖家列表": sellerDetail
        })
        chatList.push(sellerDetail)
      }
      this.setData({
        chatList: this.data.chatList.concat(chatList)
      })
    }
    
    this.createRoomWatcher(roomList)
  },

  async tabSelect(e) {
    if (!selecting) {
      this.data.hasMore = true
      selecting = true
      chatList = []
      if (Object.keys(watcher).length != 0) {
        console.log("监听关闭")
        watcher.close()
        watcher = {}
      }
      this.setData({
        index: e.currentTarget.dataset.id,
        scrollLeft: (e.currentTarget.dataset.id - 1) * 60,
        chatList
      })
      console.log("chatlist clear in tab")
      console.log(chatList)
      wx.showLoading({
        title: '加载中',
      })

      start = 0
      if (this.data.index == 0) {
        console.log("clear sellerRoom data in tab")
        //获取作为买家身份的所有房间号
        params = {
          id: userid,
          start: start,
          count: MAX_CHATLIST_SIZE
        }
        res = await api.getRoomByBuyer(params)
        if (res.errno == -1) {
          console.log("获取房间信息失败")
          return
        }
        buyerRoom = res.data
        start = buyerRoom.length
        roomList = []
        for (let i = 0; i < buyerRoom.length; ++i) {
          //获取卖家商品名称和图片链接
          let commodity_id = buyerRoom[i].commodity_id
          let avatar_url = buyerRoom[i].seller_avatar
          let name = buyerRoom[i].seller_name
          res = await api.getCommodityDetail({
            id: commodity_id
          })
          if (res.errno == -1) {
            console.log("获取商品信息出错")
            return
          }
          res = res.data
          buyerDetail = {
            avatar_url: avatar_url,
            name: name,
            title: res.title,
            image_url: res.img_url[0],
          }
          //在买家列表中获取最后一条聊天记录以及未读取的聊天记录以及时间
          console.log({
            "buyerRoom[i]6": buyerRoom[i]
          })
          room_id = buyerRoom[i]._id
          roomList.push(room_id)
          params = {
            room_id,
            start: 0,
            count: 10
          }
          res = await api.getChatMsgByRoomId(params)
          if (res.errno == -1) {
            console.log("获取聊天信息出错")
            return
          }
          res = res.data
          let unreadMsgCount = 0
          let lastContent = ""
          let lastContentTime = ""
          let threeDaysAgo = new Date().setDate(new Date().getDate() - 7)
          if (new Date(res[0].send_time).getTime() < threeDaysAgo) {
            await api.deleteAllMsgByRoomId(room_id)
            await api.deleteRoomById(room_id)
          }
          lastContent = res[0].content
          lastContentTime = utils.formatTime(res[0].send_time)
          for (let j = 0; j < res.length; ++j) {
            if (res[j].sender_id != userid) {
              if (!res[j].is_read) {
                unreadMsgCount++
              } else {
                break
              }
            }
          }
          buyerDetail = {
            ...buyerDetail,
            room_id,
            unreadMsgCount,
            lastContent,
            lastContentTime
          }
          console.log({
            "买家列表": buyerDetail
          })
          chatList.push(buyerDetail)
        }
        console.log({
          "buy chatlist in tab": chatList
        })
        this.setData({
          chatList,
        })
      } else {
        console.log("clear buyerRoom data in tab")
        //获取作为卖家身份的所有房间号
        params = {
          id: userid,
          start: start,
          count: MAX_CHATLIST_SIZE
        }
        res = await api.getRoomBySeller(params)
        if (res.errno == -1) {
          console.log("获取房间信息失败")
          return
        }
        sellerRoom = res.data
        start = sellerRoom.length
        roomList = []
        for (let i = 0; i < sellerRoom.length; ++i) {
          //在卖家列表中获取最后一条聊天记录以及未读取的聊天记录以及时间
          room_id = sellerRoom[i]._id
          roomList.push(room_id)
          commodity_id = sellerRoom[i].commodity_id
          res = await api.getCommodityDetail({
            id: commodity_id
          })
          if (res.errno == -1) {
            console.log("获取商品信息出错")
            return
          }
          //获取买家的头像和昵称信息
          sellerDetail = {
            name: sellerRoom[i].buyer_name,
            avatar_url: sellerRoom[i].buyer_avatar,
            title: res.data.title
          }
          params = {
            room_id,
            start: 0,
            count: 10
          }
          res = await api.getChatMsgByRoomId(params)
          if (res.errno == -1) {
            console.log("获取聊天信息出错")
            return
          }
          res = res.data
          let unreadMsgCount = 0
          let lastContent = ""
          let lastContentTime = ""
          let threeDaysAgo = new Date().setDate(new Date().getDate() - 7)
          if (new Date(res[0].send_time).getTime() < threeDaysAgo) {
            await api.deleteAllMsgByRoomId(room_id)
            await api.deleteRoomById(room_id)
          }
          lastContent = res[0].content
          lastContentTime = utils.formatTime(res[0].send_time)
          for (let j = 0; j < res.length; ++j) {
            if (res[j].sender_id != userid) {
              if (!res[j].is_read) {
                unreadMsgCount++
              } else {
                break
              }
            }
          }
          sellerDetail = {
            ...sellerDetail,
            room_id,
            unreadMsgCount,
            lastContent,
            lastContentTime
          }
          console.log({
            "卖家列表": sellerDetail
          })
          chatList.push(sellerDetail)
        }
        console.log({
          "sell chatlist in tab": chatList
        })
        this.setData({
          chatList,
        })
      }

      this.createRoomWatcher(roomList)

      wx.hideLoading()
      selecting = false
    }
  },

  OnEnterChatroom(event) {
    const id = event.currentTarget.dataset.id
    wx.navigateTo({
      url: '../chatroom/chatroom?room=' + id,
    })
  },

  onNavigateBack() {
    wx.navigateBack({
      delta: 1
    })
  },

  async onUnload() {
    console.log("onUnload")
    if (Object.keys(watcher).length != 0) {
      console.log("监听关闭")
      watcher.close()
    }
    watcher = {}
  },

  async onHide() {
    console.log("onHide")
    if (Object.keys(watcher).length != 0) {
      console.log("监听关闭")
      watcher.close()
      watcher = {}
    }    
  }
})