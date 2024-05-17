import {channels, channelsMap} from "../conversation/conversationlist";
import {username} from "../auth/login";

const pako= require('pako');
export let token = "0";
export let socket;
export let server = "://localhost:8080/"
export let userid;
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
     channelsMap[message.Channel].push(message)
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
     channelsMap[0] = []
     let result = await makeRequest(log,null)
     if (result.Response !== 'null') {
          channels = JSON.parse(result.Response)
          channels.forEach((element) => {
               channelsMap[element.ChannelID] = []
          })
     }
}
export function RequestChat(CurrentChannel) {
     let log = new XMLHttpRequest()
     log.open("GET", "http" + server + "message/" + CurrentChannel, true)
     log.withCredentials = true;
     log.setRequestHeader('Authorization', token)
     log.send()
}
export async function CreateChannel(users) {
     let user_list = users.replace(/\s/g,'').split(";")
     user_list.unshift(username)
     let log = new XMLHttpRequest()
     log.withCredentials = true;
     log.open("POST", "http" + server + "channel/create", true)
     log.setRequestHeader('Authorization', token)
     let result = await makeRequest(log, JSON.stringify(user_list))
     return result.Status === 201
}
export async function DeleteChannel(channel) {
     let log = new XMLHttpRequest()
     log.open("POST", "http" + server + "channel/delete", true)
     log.withCredentials = true;
     log.setRequestHeader('Authorization', token)
     let result = await makeRequest(log, JSON.stringify([userid, channel]))
     return result.Status
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