import {SetChannel} from "../conversation/conversation";
const pako= require('pako');
export let user = {token: "0", userid: "0", username: "", joinDate: null}
export let socket;
export let server = "http://localhost:8080/"
export let channelsMap = new Map()
export let channels = null
export function removeMessage(channelID, messageID) {
     channelsMap[channelID] = channelsMap[channelID].filter((element) => {
          return element.ID !== messageID
     })
}
export function UpdateUsername(_username) {
     user.username = _username
}
export function makeRequest(request, body) {
     return new Promise(function(resolve, reject) {
          request.onload = () => {
               if (request.status >= 200 && request.status < 300) {
                    resolve({
                         Status: request.status,
                         Response: request.response,
                    })
               } else {
                    reject({
                         Status: request.status,
                         Response: request.responseText,
                    })
               }
          }
          request.onerror = () => {
               reject({
                    Status: request.status,
                    Response: request.responseText,
               })
          }
          request.ontimeout = () => {
              reject({
                  Status: 408,
                  Response: null,
              })
          }
          request.send(body)
     })
}
export async function LogIn(_username, _password) {
     let log = new XMLHttpRequest();
     log.open("POST",server + "auth/login",true);
     log.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
     await makeRequest(log, 'username=' + _username + '&password=' + _password).then(
          (_result) => {
              let response = _result.Response.split("/")
              user.userid = parseInt(response[0])
              user.token = response[1]
         },
         () => {
              user.token = "0"
         }
     )
}
export function OpenSocket() {
    socket = new WebSocket("ws://" + server.slice(server.indexOf("//") + 2) + "ws/" + user.token)
    setTimeout(() => {
        if (socket.readyState !== WebSocket.OPEN) {
            socket.close()
        }
    }, 8000)
}
export async function Register(_username, _password) {
     let log = new XMLHttpRequest();
     log.open("POST",server + "auth/register",true);
     log.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
     return await makeRequest(log,'username=' + _username + '&password=' + _password).then(
         () => {
              return true
         },
         () => {
              return false
         }
     )
}
export let send = msg => {
          socket.send(msg);
};
export function SaveMessage(message) {
     if (channelsMap[message.Channel.valueOf()].some(e => e.ID === message.ID.valueOf())) {
         let message_index = channelsMap[message.Channel.valueOf()].findIndex(e => e.ID === message.ID.valueOf())
         if (channelsMap[message.Channel.valueOf()][message_index].Fetch === true) {
             removeMessage(message.Channel.valueOf(), message.ID.valueOf())
         }
         else return
     }
     let insertPos = channelsMap[message.Channel.valueOf()].findIndex((element) => element.ID > message.ID.valueOf());
     if (insertPos === -1) {
          channelsMap[message.Channel.valueOf()].push(message)
     }
     else channelsMap[message.Channel.valueOf()].splice(insertPos, 0, message)
}
export function Decompress(data) {
     let binaryString = atob(data)
     let arr = new Uint8Array(binaryString.length)
     for (let i = 0; i < binaryString.length; i++) {
          arr[i] = binaryString.charCodeAt(i);
     }
     return pako.inflate(arr, {to: 'string'})
}
export async function RequestChannelList() {
     let log = new XMLHttpRequest()
     log.open("GET",server + "channel/read",true)
     log.withCredentials = true;
     log.setRequestHeader('Authorization', user.token)
     channelsMap = new Map()
     channelsMap[0] = []
     channels = []
     let result = await makeRequest(log,null)
     if (result.Response !== 'null') {
          channels = JSON.parse(result.Response)
          channels.forEach((element) => {
               channelsMap[element.ChannelID] = null
          })
     }
     else {
          channels = null
     }
}
export async function RequestChat(CurrentChannel) {
     let log = new XMLHttpRequest()
     let lastMessage = "0"
     if (channelsMap[CurrentChannel].length !== 0) {
          lastMessage = channelsMap[CurrentChannel].find((e) => e.Fetch !== true).ID
     }
     log.open("GET", server + "message/read/" + CurrentChannel + "/" + lastMessage, true)
     log.withCredentials = true;
     log.setRequestHeader('Authorization', user.token)
     await makeRequest(log, null).then(
         () => {
              return true
         },
         () => {
              return false
         }
)
}
export async function RequestChatMember(CurrentChannel) {
     let log = new XMLHttpRequest()
     log.open("GET", server + "channel/member/" + CurrentChannel, true)
     log.withCredentials = true;
     log.setRequestHeader('Authorization', user.token)
     return await makeRequest(log, null).then(
         (result) => {
              return JSON.parse(result.Response)
         },
         () => {
              return null
         }
     )
}
export async function CreateChannel(channel, users) {
     users.unshift([user.username, String(user.userid)])
     let userIDList = []
     users.forEach((user) => userIDList.push(user[1]))
     userIDList.unshift(channel)
     let log = new XMLHttpRequest()
     log.withCredentials = true;
     log.open("POST", server + "channel/create", true)
     log.setRequestHeader('Authorization', user.token)
     let result = await makeRequest(log, JSON.stringify(userIDList))
     return result.Status === 201
}
export async function DeleteChannel(channel) {
     let log = new XMLHttpRequest()
     log.open("POST", server + "channel/delete", true)
     log.withCredentials = true;
     log.setRequestHeader('Authorization', user.token)
     return await makeRequest(log, JSON.stringify([String(user.userid), String(channel)])).then(
         () => {
              return true
         },
         () => {
              return false
         }
     )
}
export async function SearchUser(_username) {
     let log = new XMLHttpRequest()
     log.open("GET", server + "user/search/" + _username, true)
     log.withCredentials = true;
     log.setRequestHeader('Authorization', user.token)
     return await makeRequest(log,null).then(
         (result) => {
              return result
         },
         (error) => {
               return error
         }
     )
}
export function LogOut() {
     user.token = "0"
     user.userid = "0"
     user.joinDate = null
     channels = null
     channelsMap = new Map()
     SetChannel(0)
     socket.close()
}
export async function ChangeChannelName(_channel, _name) {
     let log = new XMLHttpRequest()
     log.open("POST", server + "channel/rename", true)
     log.withCredentials = true
     log.setRequestHeader('Authorization', user.token)
     return await makeRequest(log, JSON.stringify([String(user.userid), String(_channel), _name])).then(
         () => {
              return true
         },
         () => {
              return false
         }
     )
}
export async function DeleteMessage(id) {
     let log = new XMLHttpRequest()
     log.open("POST", server + "message/delete")
     log.withCredentials = true
     log.setRequestHeader('Authorization', user.token)
     return await makeRequest(log, id).then(
         () => {
              return true
         },
         () => {
              return false
         }
     )
}
export async function GetMessage(id, channel) {
     let log = new XMLHttpRequest()
     log.open("POST", server + "message/get")
     log.withCredentials = true
     log.setRequestHeader('Authorization', user.token)
     return await makeRequest(log, id).then(
         (success) => {
              SaveMessage(JSON.parse(Decompress(success.Response)))
         },
         (error) => {
              if (error.Status === 403) {
                   SaveMessage({
                        ID: id,
                        Type: null,
                        Channel: channel,
                   })
              }
         }
     )
}
export async function ChangePassword(oldPassword, newPassword) {
     let log = new XMLHttpRequest()
     log.open("POST", server + "auth/password")
     log.withCredentials = true
     log.setRequestHeader('Authorization', user.token)
     return await makeRequest(log, JSON.stringify([oldPassword, newPassword])).then(
         () => {
              return 200
         },
         (error) => {
              return error.Status
         }
     )
}
export async function RequestUserInfo(user_id) {
     let log = new XMLHttpRequest()
     log.open("GET", server + "user/get/" + user_id, true)
     log.withCredentials = true;
     log.setRequestHeader('Authorization', user.token)
     return await makeRequest(log,null).then(
         (result) => {
              user.joinDate = result.Response
              return true
         },
         () => {
              return false
         }
     )
}