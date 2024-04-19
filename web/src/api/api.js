import {channelsMap, RequestChannelList} from "../conversation/conversationlist";

const pako= require('pako');
export let token = "0";
export let socket;
export let server = "://localhost:8080/"
export let userid;
export function LogIn(_username, _password) {
     let log = new XMLHttpRequest();
     log.open("POST","http" + server + "auth/login",false);
     log.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
     log.send('username=' + _username + '&password=' + _password);
     if (log.status === 401) {
          token = "0"
          return
     }
     let response = log.responseText.split("/")
     userid = parseInt(response[0])
     token = response[1]
     socket = new WebSocket("ws" + server + "ws/"+token)
     RequestChannelList()
}
export function Register(_username, _password) {
     let log = new XMLHttpRequest();
     log.open("POST","http" + server + "auth/register",false);
     log.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
     log.send('username=' + _username + '&password=' + _password);
     if (log.status === 409) return false
     else if (log.status === 201) return true
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