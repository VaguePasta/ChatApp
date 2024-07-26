import {makeRequest, server} from "./api";
import {ResetMember} from "../chatmenu/members";
import {SetChannel} from "../conversation/conversation";
import {SetChannelList, SetChannelMap} from "./channel";

export let User = {token: "0", userid: "0", username: "", joinDate: null}
export let socket;
export async function LogIn(_username, _password) {
    let log = new XMLHttpRequest();
    log.open("POST",server + "auth/login",true);
    log.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
    await makeRequest(log, 'username=' + _username + '&password=' + _password).then(
        (_result) => {
            let response = _result.Response.split("/")
            User.userid = parseInt(response[0])
            User.token = response[1]
        },
        () => {
            User.token = "0"
        }
    )
}

export function LogOut() {
    ResetMember()
    User.token = "0"
    User.userid = "0"
    User.joinDate = null
    SetChannelList(null)
    SetChannelMap(new Map())
    SetChannel(0)
    socket.close()
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

export function OpenSocket() {
    socket = new WebSocket("ws://" + server.slice(server.indexOf("//") + 2) + "ws/" + User.token)
    setTimeout(() => {
        if (socket.readyState !== WebSocket.OPEN) {
            socket.close()
        }
    }, 8000)
}