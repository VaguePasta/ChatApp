import {username} from "../auth/login";
import {SetChannel} from "../conversation/conversation";
const pako= require('pako');
export let token = "0";
export let socket;
export let server = "://localhost:8080/"
export let userid;
export let channelsMap = new Map()
export let channels = []
export function removeMessage(channelID, messageID) {
     channelsMap[channelID] = channelsMap[channelID].filter((element) => {
          return element.ID !== messageID
     })
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
          request.send(body)
     })
}
export async function LogIn(_username, _password) {
     let log = new XMLHttpRequest();
     log.open("POST","http" + server + "auth/login",true);
     log.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
     await makeRequest(log, 'username=' + _username + '&password=' + _password).then(
          (_result) => {
              let response = _result.Response.split("/")
              userid = parseInt(response[0])
              token = response[1]
              socket = new WebSocket("ws" + server + "ws/" + token)
         },
         () => {
              token = "0"
         }
     )
     if (token !== "0") await RequestChannelList()
}
export async function Register(_username, _password) {
     let log = new XMLHttpRequest();
     log.open("POST","http" + server + "auth/register",true);
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
     if (channelsMap[message.Channel].some(e => e.ID === message.ID)) return
     let insertPos = channelsMap[message.Channel].findIndex((element) => element.ID > message.ID);
     if (insertPos === -1) {
          channelsMap[message.Channel].push(message)
     }
     else channelsMap[message.Channel].splice(insertPos, 0, message)
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
     log.open("GET","http" + server + "channel/read",true)
     log.withCredentials = true;
     log.setRequestHeader('Authorization', token)
     channelsMap = new Map()
     channelsMap[0] = []
     let result = await makeRequest(log,null)
     if (result.Response !== 'null') {
          channels = JSON.parse(result.Response)
          channels.forEach((element) => {
               channelsMap[element.ChannelID] = []
          })
     }
     else {
          channels = []
     }
}
export function RequestChat(CurrentChannel) {
     let log = new XMLHttpRequest()
     let lastMessage = "0"
     if (channelsMap[CurrentChannel].length !== 0) {
          lastMessage = channelsMap[CurrentChannel][0].ID
     }
     log.open("GET", "http" + server + "message/read/" + CurrentChannel + "/" + lastMessage, true)
     log.withCredentials = true;
     log.setRequestHeader('Authorization', token)
     log.send()
}
export async function RequestChatMember(CurrentChannel) {
     let log = new XMLHttpRequest()
     log.open("GET", "http" + server + "channel/member/" + CurrentChannel, true)
     log.withCredentials = true;
     log.setRequestHeader('Authorization', token)
     return await makeRequest(log, null).then(
         (result) => {
              return JSON.parse(result.Response)
         },
         () => {
              return null
         }
     )
}
export async function CreateChannel(users) {
     users.unshift(username)
     let log = new XMLHttpRequest()
     log.withCredentials = true;
     log.open("POST", "http" + server + "channel/create", true)
     log.setRequestHeader('Authorization', token)
     let result = await makeRequest(log, JSON.stringify(users))
     return result.Status === 201
}
export async function DeleteChannel(channel) {
     let log = new XMLHttpRequest()
     log.open("POST", "http" + server + "channel/delete", true)
     log.withCredentials = true;
     log.setRequestHeader('Authorization', token)
     return await makeRequest(log, JSON.stringify([String(userid), String(channel)])).then(
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
     log.open("GET", "http" + server + "user/" + _username, true)
     log.withCredentials = true;
     log.setRequestHeader('Authorization', token)
     return await makeRequest(log,null).then(
         () => {
              return true
         },
         () => {
               return false
         }
     )
}
export function LogOut() {
     token = "0"
     SetChannel(0)
     socket.close()
}
export async function ChangeChannelName(_channel, _name) {
     let log = new XMLHttpRequest()
     log.open("POST", "http" + server + "channel/rename", true)
     log.withCredentials = true
     log.setRequestHeader('Authorization', token)
     return await makeRequest(log, JSON.stringify([String(userid), String(_channel), _name])).then(
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
     log.open("POST", "http" + server + "message/delete")
     log.withCredentials = true
     log.setRequestHeader('Authorization', token)
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
     log.open("POST", "http" + server + "message/get")
     log.withCredentials = true
     log.setRequestHeader('Authorization', token)
     return await makeRequest(log, id).then(
         (success) => {
              return success.Status
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
     log.open("POST", "http" + server + "auth/password")
     log.withCredentials = true
     log.setRequestHeader('Authorization', token)
     return await makeRequest(log, JSON.stringify([oldPassword, newPassword])).then(
         () => {
              return 200
         },
         (error) => {
              return error.Status
         }
     )
}