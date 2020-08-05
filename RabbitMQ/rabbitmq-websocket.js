const getRabbitMQConnection = require("./rabbitMQ-conncetion-creator.js")
let ws = require("nodejs-websocket");

const registeredWebSockets = {}

function bindRoutingKey(connection, websocketUser) {
    if (!registeredWebSockets[websocketUser]) {

    }
    connection.createChannel(function(error1, channel) {
        if (error1) {
          throw error1;
        }
        const exchange = 'instant-message';

        channel.assertExchange(exchange, 'topic', {
          durable: false
        });

        const routingKey = "*." + websocketUser
        channel.assertQueue(routingKey, {
          exclusive: false
        }, function(error2, q) {
          if (error2) {
            throw error2;
          }
          const registeredWebSocket = registeredWebSockets[websocketUser]
          if (!!registeredWebSocket.channel) {
            registeredWebSocket.channel.close()
          }
          registeredWebSocket.channel = channel
          //已发送的数据存储，用于异步检验发送是否成功
          if (!registeredWebSocket.msgSentLog) registeredWebSocket.msgSentLog = []

          registeredWebSocket.webSocketConnection.on('text', (str) => {
            if (str.startsWith("messageReceived:")) {
              const msgId = str.split(":")[1]
              const targetMsgInfo = registeredWebSocket.msgSentLog.find(o => o.msgId == msgId)
              if (!targetMsgInfo) return;
              targetMsgInfo.success = true
            }
          })

          console.log('opening routing-queue rabbitMQ ' + routingKey);
          channel.bindQueue(q.queue, exchange, routingKey);


          let failCount = 0
          channel.consume(q.queue, async function(msg) {
              console.log("RECEIVE LOG：" + websocketUser + " receive msg " + msg.toString())
              const msgContent = JSON.parse(msg.content)
              const msgId = msgContent.id
              const targetMsgInfo = {
                msgId: msgId,
                msg: msg,
                success: false
              }
              registeredWebSocket.msgSentLog.push(targetMsgInfo)

              const sendTextPromise = new Promise((resolve) => {
                registeredWebSocket.webSocketConnection.sendText(msg.content.toString())
                const startTime = new Date()
                const timeoutSec = 3
                let intervalId = setInterval(() => {
                  if (targetMsgInfo.success) {
                    clearInterval(intervalId)
                    resolve(true)
                  } else {
                    if (new Date() - startTime > timeoutSec * 1000) {
                      clearInterval(intervalId)
                      resolve(false)
                    }
                  }
                }, 100)
              })

              if (await sendTextPromise) {
                failCount = 0
                channel.ack(msg)
              } else {
                failCount ++
                channel.reject(msg, true)
                if (failCount >= 3) {
                  channel.close()
                  remove(registeredWebSocket.webSocketConnection)
                }
              }
            }, {
              noAck: false
          });

        });
    });
}

function remove(conn) {
  try {
    for (let key in registeredWebSockets) {
      if (registeredWebSockets[key].webSocketConnection === conn) {
        registeredWebSockets[key].channel.close()
        delete registeredWebSockets[key]
        console.log("关闭连接" + key)
        break;
      }
    }
  } catch( e) {
    console.error(e)
  }
}

getRabbitMQConnection('amqp://localhost').then(rabbitMQConnection => {
  
    var server = ws.createServer(function(conn){
        conn.on("text", function (str) {
          let params = str.split(";");
          if (params.length == 2) {
              if (params[0] == "register-websocket") {
                if (params[1] == "") {
                  remove(conn)
                } else {
                  registeredWebSockets[params[1]] = { webSocketConnection: conn }
                  bindRoutingKey(rabbitMQConnection, params[1])
                }
              }
          }
          console.log("message:"+str)
        })
        conn.on("close", function (code, reason) {
          remove(conn)
        });
        conn.on("error", function (code, reason) { 
          remove(conn)
        });
    }).listen(5678)
})

