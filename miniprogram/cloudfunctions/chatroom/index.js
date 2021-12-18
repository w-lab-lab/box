// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: "cloud1-6g3tf8v64f9a5fc3"
})

const TcbRouter = require('tcb-router')

const db = cloud.database()
const $ = db.command.aggregate
const _ = db.command

const chatMsgCollection = db.collection('chat_message')
const chatroomCollection = db.collection('chatroom')

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const app = new TcbRouter({
    event
  })

  //根据房间id获取聊天记录
  app.router('getChatMsgByRoomId', async (ctx, next) => {
    const {
      room_id,
      start,
      count
    } = event.params
    try {
      ctx.body = await chatMsgCollection.where({
          room_id: room_id,
        })
        .orderBy('send_time', 'desc')
        .skip(start)
        .limit(count)
        .get()
      ctx.body.errno = 0
    } catch (e) {
      ctx.body = {
        errno: -1
      }
    }
  })

  //根据房间id获取最新聊天记录
  app.router('getNewMsgByRoomId', async (ctx, next) => {
    const {
      userid,
      roomidList,
      start,
      count
    } = event.params
    try {
      ctx.body = await chatMsgCollection.where({
          room_id: _.in(roomidList),
          sender_id:_.neq(userid)
        })
        .orderBy('send_time', 'desc')
        .skip(start)
        .limit(count)
        .get()
      ctx.body.errno = 0
    } catch (e) {
      ctx.body = {
        errno: -1
      }
    }
  })

  //根据sender_id获取其所有房间id
  app.router('getRoomIdBySender', async (ctx, next) => {
    const {
      sender_id
    } = event.params

    try {
      ctx.body = await chatMsgCollection
        .aggregate()
        .match({
          sender_id: sender_id
        })
        .group({
          //不指定id字段是为了下面分组查找
          _id: null,
          //categories是设置的字段，addToSet是添加字段，$name是获取数据库中的name字段数据
          room_id: $.addToSet('$room_id')
        })
        .end()
      ctx.body.errno = 0
    } catch (e) {
      ctx.body = {
        errno: -1
      }
    }
  })

  //发送消息
  app.router('sendMessage', async (ctx, next) => {
    let params = event.params
    const sender_id = params.sender_id
    const room_id = params.room_id
    const content = params.content
    // 创建事务
    const transaction = await db.startTransaction()
    try {

      res = await cloud.openapi.security.msgSecCheck({
        content: JSON.stringify(event.params)
      })

      await transaction
        .collection("chat_message")
        .add({
          data: {
            ...params,
            send_time: db.serverDate(),
            withdrawn: false
          }
        })
      transaction.commit()
      ctx.body = {
        errno: 0
      }
    } catch (e) {
      transaction.rollback()
      ctx.body = {
        errno: -1
      }
    }
  })

  //撤回消息
  app.router('withdrawMessage', async (ctx, next) => {
    const message_id = event.params.message_id
    try {
      ctx.body = await chatMsgCollection.doc(message_id)
        .update({
          data: {
            withdrawn: true
          }
        })
      ctx.body.errno = 0
    } catch (e) {
      ctx.body = {
        errno: -1,
      }
    }
  })

  //创建聊天房间
  app.router('createRoom', async (ctx, next) => {
    let params = event.params
    const buyer_name = params.buyer_name
    const buyer_avatar = params.buyer_avatar
    const buyer_id = params.buyer_id
    const seller_name = params.seller_name
    const seller_avatar = params.seller_avatar
    const seller_id = params.seller_id
    const commodity_id = params.commodity_id

    // 创建事务
    // const transaction = await db.startTransaction()
    try {

      res = await cloud.openapi.security.msgSecCheck({
        content: JSON.stringify(event.params)
      })

      await chatroomCollection
        .add({
          data: {
            buyer_name,
            buyer_avatar,
            buyer_id,
            seller_name,
            seller_avatar,
            seller_id,
            commodity_id,
            create_time: db.serverDate()
          }
        })
        .then(res => {
          ctx.body = res
        })

      // await transaction.commit()
      ctx.body.errno = 0
    } catch (e) {
      transaction.rollback()
      ctx.body = {
        errno: -1
      }
    }
  })

  //todo: 删除房间

  //根据房间id获取房间信息
  app.router('getRoomInfo', async (ctx, next) => {
    const {
      room_id
    } = event.params
    try {
      ctx.body = await chatroomCollection.doc(room_id)
        .field({
          create_time: false
        })
        .get()
      ctx.body.errno = 0
    } catch (e) {
      ctx.body = {
        errno: -1
      }
    }
  })

  //根据发送者id和商品id获取房间信息
  app.router('getRoomBySenderAndCommodity', async (ctx, next) => {
    const {
      sender_id,
      commodity_id
    } = event.params
    try {
      ctx.body = await chatroomCollection
        .where(_.or([
          {
            buyer_id: sender_id
          }, 
          {
            seller_id: sender_id
          }
        ]).and([{
          commodity_id: commodity_id
        }]))
        .get()
      ctx.body.errno = 0
    } catch (e) {
      ctx.body = {
        errno: -1
      }
    }
  })

  //根据buyer_id获取所有的房间
  app.router('getRoomByBuyer', async (ctx, next) => {
    const {
      id,
      start,
      count
    } = event.params
    try {
      ctx.body = await chatroomCollection
        .where({
          buyer_id: id,
        })
        .skip(start)
        .limit(count)
        .get()
      ctx.body.errno = 0
    } catch (e) {
      ctx.body = {
        errno: -1
      }
    }
  })

  //获取所有的房间
  app.router('getRoomBySeller', async (ctx, next) => {
    const {
      id,
      start,
      count
    } = event.params
    try {
      ctx.body = await chatroomCollection
        .where({
          seller_id: id,
        })
        .skip(start)
        .limit(count)
        .get()
      ctx.body.errno = 0
    } catch (e) {
      ctx.body = {
        errno: -1
      }
    }
  })


  //删除指定room_id的房间
  app.router('deleteRoomById', async (ctx, next) => {
    const {
      room_id
    } = event.params
    try {
      ctx.body = await chatroomCollection
        .doc(room_id)
        .remove()
      ctx.body.errno = 0
    } catch (e) {
      ctx.body = {
        errno: -1
      }
    }
  })

  //删除指定room_id的房间的所有消息
  app.router('deleteAllMsgByRoomId', async (ctx, next) => {
    const {
      room_id
    } = event.params
    try {
      ctx.body = await chatMsgCollection
        .where({
          room_id
        })
        .remove()
      ctx.body.errno = 0
    } catch (e) {
      ctx.body = {
        errno: -1
      }
    }
  })

    //删除指定room_id的所有过期消息
    app.router('deleteMsgOutdated', async (ctx, next) => {
      const {
        room_id
      } = event.params
      try {
        ctx.body = await chatMsgCollection
          .where({
            room_id, 
            //删除天数早于三天前的信息
            send_time: _lte(db.serverDate({
              offset: -7*24*60*60*1000
            }))
          })
          .remove()
        ctx.body.errno = 0
      } catch (e) {
        ctx.body = {
          errno: -1
        }
      }
    })

    //将msg标记为已读
    app.router('setAsRead', async (ctx, next) => {
      const {
        setReadMsg
      } = event.params
      try {
        ctx.body = await chatMsgCollection
          .where({
            _id:_.in(setReadMsg),
            is_read:false
          })
          .update({
            data: {
              is_read: true
            },            
          })
        ctx.body.errno = 0
      } catch (e) {
        ctx.body = {
          errno: -1
        }
      }
    })
  return app.serve()
}