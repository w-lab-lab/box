const {
	withdrawMessage
} = require('../../api/api')
const api = require('../../api/api')
const cache = require('../../cache/cache')
const util = require('../../utils/utils');

const MAX_CHATMSG_LIMIT_SIZE = 10
let sender_avatar = ""
let sender_name = ""
let receiver_avatar = ""
let receiver_name = ""
let start = 0
let res = {}
let _res = {}
let params = {}
let roomDetail = {}
let receiver_id = ""
let sender_id = ""
let commodity_id = ""
let room = []
let chatroom_id = ""
let content = ""
let chatMessage = []
let watcher = {}
let setReadMsg = []

const db = wx.cloud.database({
	env: "cloud1-6g3tf8v64f9a5fc3"
})

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		isLoading: false,
		hasMore: true,
		inputContent: ""
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	async onLoad(options) {
		console.log("onLoad")
		wx.showLoading({
			title: '加载中',
		})

		// 获取我的id,头像, 昵称等信息
		res = await cache.getMyInfoAndMyUniversityInfo()
		if (res.errno == -1) {
			console.log("获取我的信息和大学信息失败！")
			return
		}
		const myInfoAndMyUniversityInfo = res.data
		sender_id = myInfoAndMyUniversityInfo.openid
		sender_avatar = myInfoAndMyUniversityInfo.avatar_url
		sender_name = myInfoAndMyUniversityInfo.name

		//如果路径中传入的是商品id的参数
		if (options.id) {
			// 获取商品id和发布者的id
			commodity_id = options.id
			res = await api.getCommodityDetail({
				id: commodity_id
			})
			if (res.errno == -1) {
				console.log("获取商品信息失败")
				return
			}
			receiver_id = res.data.user_id
			if (receiver_id != "") {
				res = await api.getUserInfoByUserId({
					userId: receiver_id
				})
				if (res.errno == -1) {
					console.log("获取用户信息失败")
					return
				}
				receiver_name = res.data.name
				receiver_avatar = res.data.avatar_url
			}
			console.log(receiver_id)
			console.log(sender_id)

			//获得该用户房间号
			params = {
				commodity_id,
				sender_id
			}
			res = await api.getRoomBySenderAndCommodity(params)
			console.log("res")
			console.log(res)
			if (res.data[0]) {
				console.log("房间创建过")
				chatroom_id = res.data[0]._id
			}

		} else if (options.room) { //如果路径中传入的是房间号参数
			chatroom_id = options.room
			res = await api.getRoomDetail({
				room_id: chatroom_id
			})
			if (res.errno == -1) {
				console.log("获取房间数据失败")
				return
			}
			//通过消息发送方是卖家还是买家确定接收方的信息
			receiver_id = res.data.seller_id == sender_id ? res.data.buyer_id : res.data.seller_id

			receiver_name = res.data.seller_id == sender_id ? res.data.buyer_name : res.data.seller_name

			receiver_avatar = res.data.seller_id == sender_id ? res.data.buyer_avatar : res.data.seller_avatar

			//获得商品的信息
			commodity_id = res.data.commodity_id
		}


		//如果以前存在聊天记录(即房间已被创建)
		if (chatroom_id != "") {

			await api.deleteMsgOutdated({
				room_id: chatroom_id
			})

			console.log({
				'以前存在过聊天记录': chatroom_id
			})

			await this.createWatcher(chatroom_id)
			start = 0
			params = {
				start: start,
				count: MAX_CHATMSG_LIMIT_SIZE,
				room_id: chatroom_id
			}
			res = await api.getChatMsgByRoomId(params)
			if (res.errno == -1) {
				console.log("获取聊天消息失败")
				return
			}
			chatMessage = res.data
			if (chatMessage.length == 0) {
				await api.deleteRoomById({
					room_id: chatroom_id
				})
				chatroom_id = ""
			}
			console.log({
				"所有聊天记录": chatMessage
			})
			setReadMsg = []
			for (let i = 0; i < chatMessage.length; ++i) {
				if (chatMessage[i].sender_id != sender_id) {
					//将所有未读信息设置为已读
					console.log({
						"标记为已读": chatMessage[i]._id
					})
					setReadMsg = setReadMsg.concat(chatMessage[i]._id)
				}
			}
			await api.setAsRead({
				setReadMsg: setReadMsg
			})
			console.log({
				'聊天记录': chatMessage
			})
		} else {
			console.log("以前不存在聊天记录")
		}
		//转换时间格式
		for (let i = 0; i < chatMessage.length; i++) {
			chatMessage[i].send_time = util.formatTime(chatMessage[i].send_time)
		}
		chatMessage.reverse()
		//返回聊天记录, 发送方id和接收方id, 当chatMessage中sender_id等于sender_id时为发送方, 当等于receiver_id时为接收方
		this.setData({
			chatMessage,
			sender_name,
			sender_avatar,
			sender_id,
			receiver_avatar,
			receiver_name,
			receiver_id,
		})
		console.log({
			"data": this.data
		})
		wx.hideLoading()
		wx.pageScrollTo({
			scrollTop: 10000,
			duration: 100,
		})
	},

	//监听聊天记录的变化, 当有新聊天记录时重新获取
	async createWatcher(chatroom_id) {
		console.log({
			"watcher created": chatroom_id
		})
		const _this = this
		watcher = await db.collection('chat_message')
			.orderBy('send_time', 'desc')
			.limit(MAX_CHATMSG_LIMIT_SIZE)
			.where({
				room_id: chatroom_id,
			})
			.watch({
				onChange(snapshot) {

					if (snapshot.docChanges[0] && snapshot.docChanges[0].dataType == "add") {
						console.log("聊天信息变化")
						console.log({
							"docs": snapshot.docChanges[0].doc,
							"type": snapshot.docChanges[0].dataType
						})
						let chatdoc = snapshot.docChanges[0].doc
						//转换时间格式
						chatdoc.send_time = util.formatTime(chatdoc.send_time)
						if (chatdoc.sender_id != sender_id) {
							chatdoc.is_read = true
						}

						_this.setData({
							chatMessage: _this.data.chatMessage.concat(chatdoc)
						})
						wx.pageScrollTo({
							scrollTop: 10000,
							duration: 100,
						})
					} else if (snapshot.docChanges[0] && snapshot.docChanges[0].dataType == "update") {
						console.log("已读情况发生变化")
						console.log({
							"docs": snapshot.docChanges[0].doc,
							"type": snapshot.docChanges[0].dataType
						})
						_this.setData({
							chatMessage
						})
					}
				},
				onError(err) {
					console.error('the watch closed because of error', err)
				}
			})
	},


	/* 发送消息 */
	async sendMessage() {
		if (this.data.inputContent != "") {
			//没有房间则创建房间
			if (chatroom_id == "") {
				console.log("没创建房间，准备创建中")
				params = {
					buyer_id: sender_id,
					buyer_name: sender_name,
					buyer_avatar: sender_avatar,
					seller_id: receiver_id,
					seller_name: receiver_name,
					seller_avatar: receiver_avatar,
					commodity_id
				}
				res = await api.createRoom(params)
				chatroom_id = res.data._id
				//创建监听
				await this.createWatcher(chatroom_id)
				let _this = this
				//延迟发送消息
				setTimeout(async function () { 
					console.log("发送消息中")
					params = {
						sender_id,
						room_id: chatroom_id,
						content: _this.data.inputContent,
						is_read: false
					}
					_this.setData({
						inputContent: ""
					})
					res = await api.sendMessage(params)
					if (res.errno == -1) {
						console.log('发送消息失败')
						return
					}
					//消息数量+1
					start += 1
				}, 1000)
			} else {
				//发送消息
				console.log("发送消息中")
				params = {
					sender_id,
					room_id: chatroom_id,
					content: this.data.inputContent,
					is_read: false
				}
				this.setData({
					inputContent: ""
				})
				res = await api.sendMessage(params)
				if (res.errno == -1) {
					console.log('发送消息失败')
					return
				}
				//消息数量+1
				start += 1
			}

		} else {
			console.log("消息不能为空")
		}
	},

	ContentInput: function (e) {
		this.setData({
			inputContent: e.detail.value
		})
	},

	InputBlur: function () {
		wx.hideKeyboard()
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	async onReady() {
		console.log("onReady")
	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	async onShow() {
		console.log("onShow")
		console.log(watcher)
		if (chatroom_id != "") {
			this.createWatcher(chatroom_id)
		}		
	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	async onHide() {
		console.log("onHide")
		if (Object.keys(watcher).length != 0) {
			console.log(
				"watcher closed"
			)
			watcher.close()
			watcher = {}
		}
	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	async onUnload() {
		console.log("onUnload")
		if (Object.keys(watcher).length != 0) {
			console.log(
				"watcher closed"
			)
			watcher.close()
			watcher = {}
		}
		chatroom_id = ""
	},

	/**
	 * 撤回消息
	 */
	async withdrawMessage(event) {
		const message_id = event.id
		params = {
			message_id
		}
		res = await api.withdrawMessage(params)
		if (res.errno == -1) {
			console.log("撤回失败")
			return
		}
		console.log("撤回成功")
	},

	//返回上一页
	onNavigateBack() {
		wx.navigateBack({
			delta: 1
		})
	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	async LoadMoreMsg() {
		//下拉刷新获取更多聊天数据
		if (!this.data.hasMore) {
			return
		}
		this.setData({
			isLoading: true
		})
		start = this.data.chatMessage.length
		console.log({
			"pullstart": start
		})
		params = {
			start: start,
			count: MAX_CHATMSG_LIMIT_SIZE,
			room_id: chatroom_id
		}
		res = await api.getChatMsgByRoomId(params)
		if (res.errno == -1) {
			console.log("加载更多商品列表失败！")
			return
		}
		const moreChatMsg = res.data
		if (moreChatMsg.length == 0) {
			console.log("没有更多数据了！")
			this.setData({
				isLoading: false,
				hasMore: false
			})
			return
		}
		console.log({
			"moreChatMsg": moreChatMsg
		})
		start += moreChatMsg.length

		setReadMsg = []
		for (let i = 0; i < moreChatMsg.length; i++) {
			moreChatMsg[i].send_time = util.formatTime(moreChatMsg[i].send_time)
			if (moreChatMsg[i].sender_id != sender_id) {
				//将所有未读信息设置为已读
				console.log({
					"标记为已读": moreChatMsg[i]._id
				})
				setReadMsg = setReadMsg.concat(moreChatMsg[i]._id)
			}
		}
		await api.setAsRead({
			setReadMsg: setReadMsg
		})

		chatMessage = this.data.chatMessage
		chatMessage.reverse()
		const newChatMessage = chatMessage.concat(moreChatMsg)
		newChatMessage.reverse()
		this.setData({
			chatMessage: newChatMessage
		})

	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	async onReachBottom() {

	},

	/**
	 * 用户点击右上角分享
	 */
	async onShareAppMessage() {

	},
})