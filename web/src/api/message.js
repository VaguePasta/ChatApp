import {makeRequest, server} from "./api";
import {socket, User} from "./auth";

import {parse} from "lossless-json";
import {channelsMap, SaveToChannelMap} from "./channel";
const pako= require('pako');
export function Decompress(data) {
    let binaryString = atob(data)
    let arr = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
        arr[i] = binaryString.charCodeAt(i);
    }
    return pako.inflate(arr, {to: 'string'})
}

export function SaveMessage(message) {
    if (message.Fetch !== true && !channelsMap[message.Channel.valueOf()].some(e => e.ID.valueOf() === message.ReplyTo.valueOf())) {
        GetMessage(message.ReplyTo.valueOf(), message.Channel.valueOf()).then()
    }
    if (channelsMap[message.Channel.valueOf()].some(e => e.ID.valueOf() === message.ID.valueOf())) {
        let message_index = channelsMap[message.Channel.valueOf()].findIndex(e => e.ID.valueOf() === message.ID.valueOf())
        if (channelsMap[message.Channel.valueOf()][message_index].Fetch === true) {
            removeMessage(message.Channel.valueOf(), message.ID.valueOf())
        }
        else return
    }
    let insertPos = channelsMap[message.Channel.valueOf()].findIndex((element) => element.ID.valueOf() > message.ID.valueOf());
    SaveToChannelMap(message.Channel.valueOf(), insertPos, message)
}

export function removeMessage(channelID, messageID) {
    channelsMap[channelID] = channelsMap[channelID].filter((element) => {
        return element.ID.valueOf() !== messageID
    })
}

export let send = msg => {
    socket.send(msg);
};

export async function DeleteMessage(id) {
    let log = new XMLHttpRequest()
    log.open("POST", server + "message/delete")
    log.withCredentials = true
    log.setRequestHeader('Authorization', User.token)
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
    log.setRequestHeader('Authorization', User.token)
    return await makeRequest(log, id).then(
        (success) => {
            SaveMessage(parse(Decompress(success.Response)))
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