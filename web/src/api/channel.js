import {User} from "./auth";
import {parse, stringify} from "lossless-json";
import {makeRequest, server} from "./api";
export let channelsMap = new Map()
export let channels = null

export function SetChannelList(list) {
    channels = list
}
export function SetChannelMap(map) {
    channelsMap = map
}
export function RemoveFromMap(channelID) {
    channelsMap.delete(channelID)
}
export function SaveToChannelMap(key, pos, value) {
    if (pos === -1) {
        channelsMap[key].push(value)
    }
    else {
        channelsMap[key].splice(pos, 0, value)
    }
}
export async function RequestChannelList(force) {
    let log = new XMLHttpRequest()
    log.open("GET",server + "channel/read/" + (force ? "force":("_"+ Math.random().toString(36).substring(7))),true)
    log.withCredentials = true;
    log.setRequestHeader('Authorization', User.token)
    channels = []
    let result = await makeRequest(log,null)
    if (result.Response !== 'null') {
        channels = parse(result.Response)
        channels.forEach((element) => {
            if (channelsMap[element.ChannelID.valueOf()] === undefined)
                channelsMap[element.ChannelID.valueOf()] = null
        })
    }
    else {
        channels = null
    }
}
export function RequestChat(CurrentChannel) {
    let log = new XMLHttpRequest()
    let lastMessage = "0"
    if (channelsMap[CurrentChannel].length !== 0) {
        lastMessage = channelsMap[CurrentChannel].find((e) => e.Fetch !== true).ID.valueOf()
    }
    log.open("GET", server + "message/read/" + CurrentChannel + "/" + lastMessage, true)
    log.withCredentials = true;
    log.setRequestHeader('Authorization', User.token)
    return new Promise((resolve) => {
        makeRequest(log, null).then(
            () => {
                resolve()
            },
            () => {
                resolve()
            }
        )
    })
}
export async function RequestChatMember(CurrentChannel) {
    let log = new XMLHttpRequest()
    log.open("GET", server + "channel/member/" + CurrentChannel, true)
    log.withCredentials = true;
    log.setRequestHeader('Authorization', User.token)
    return await makeRequest(log, null).then(
        (result) => {
            return parse(result.Response)
        },
        () => {
            return null
        }
    )
}
export async function CreateChannel(channel, users) {
    let userList = []
    users.forEach((e) => {
        userList.push([e[0], e[2]])
    })
    userList.unshift(channel,[User.userid, 'admin'])
    let log = new XMLHttpRequest()
    log.withCredentials = true;
    log.open("POST", server + "channel/create", true)
    log.setRequestHeader('Authorization', User.token)
    let result = await makeRequest(log, stringify(userList))
    return result.Status === 201
}
export async function DeleteChannel(channel) {
    let log = new XMLHttpRequest()
    log.open("POST", server + "channel/delete", true)
    log.withCredentials = true;
    log.setRequestHeader('Authorization', User.token)
    return await makeRequest(log, stringify([User.userid, channel])).then(
        () => {
            return true
        },
        () => {
            return false
        }
    )
}

export async function ChangeChannelName(Channel, Name) {
    let log = new XMLHttpRequest()
    log.open("POST", server + "channel/rename", true)
    log.withCredentials = true
    log.setRequestHeader('Authorization', User.token)
    return await makeRequest(log, stringify({Channel, Name})).then(
        () => {
            return true
        },
        () => {
            return false
        }
    )
}
export function LeaveChannel(_channel) {
    let log = new XMLHttpRequest()
    log.open("POST", server + "channel/leave", true)
    log.withCredentials = true
    log.setRequestHeader('Authorization', User.token)
    return makeRequest(log, stringify([_channel]))
}
export function JoinChannelFromCode(code) {
    let log = new XMLHttpRequest()
    log.open("POST", server + "user/join", true)
    log.withCredentials = true
    log.setRequestHeader('Authorization', User.token)
    return makeRequest(log, stringify(code))
}
export function ChangeCode(command, channel) {
    let log = new XMLHttpRequest()
    log.open("POST", server + "channel/invite", true)
    log.withCredentials = true
    log.setRequestHeader('Authorization', User.token)
    return makeRequest(log, stringify([command, channel]))
}
export function KickMember(_user, _channel) {
    let log = new XMLHttpRequest()
    log.open("POST", server + "channel/leave", true)
    log.withCredentials = true
    log.setRequestHeader('Authorization', User.token)
    return makeRequest(log, stringify([_user, _channel]))
}