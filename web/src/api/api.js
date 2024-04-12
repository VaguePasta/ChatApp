import {channelsMap, RequestChannelList} from "../conversation/conversationlist";
import {RequestChat} from "../conversation/conversation";

export let token = "0";
export let socket;
export let server = "://localhost:8080/"

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
     if (channelsMap[message.Channel] === undefined) {
          channelsMap[message.Channel] = []
          RequestChat(message.Channel)
     }
     channelsMap[message.Channel].push(message)
}