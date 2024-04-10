import {channelsMap, RequestChannelList} from "../conversation/conversationlist";

export let token = "0";
let socket;
export let server = "://localhost:8080/"

function SaveMessage(data) {
     let message = JSON.parse(data)
     if (channelsMap[message.Channel] === undefined) {
          channelsMap[message.Channel] = []
     }
     channelsMap[message.Channel].push(message)
}

export function LogIn(_username, _password) {
     let log = new XMLHttpRequest();
     log.open("POST","http" + server + "auth/login",false);
     log.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
     log.send('username=' + _username + '&password=' + _password);
     if (log.status === 401) {
          token = "0"
          return
     }
     token = log.responseText
     socket = new WebSocket("ws" + server + "ws/"+token)
     socket.addEventListener("open",(() => {
          console.log("Connected.")
     }))
     socket.addEventListener("message", (event => {
          SaveMessage(event.data)
     }))
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