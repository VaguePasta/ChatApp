import {ChatHistory} from "../chat/chatHistory";
import {channels, channelsMap, Decompress, RequestChannelList, SaveMessage, socket, token} from "../api/api";
import {Navigate} from "react-router-dom";
import {ConversationList} from "../conversation/conversationlist";
import "./dashboard.scss"
import {createContext, useEffect, useState} from "react";
import {CurrentChannel} from "../conversation/conversation";
export const CurrentChatContext = createContext({Current:0, Channels: [], Content: [], LoadOldMessage: false})
export function Dashboard() {
    const [channelHistory,update] = useState({Current: 0, Channels: [], Content: [], LoadOldMessage: false})
    function onMessage(message) {
        SaveMessage(message)
        if (message.Type === false) {
            updateList(channels.findIndex((channel) => channel.ChannelID === message.Channel))
            if (message.Channel === CurrentChannel) {
                handler(false)
            }
        }
        else if (message.Channel === CurrentChannel) {
            handler(true)
        }
    }
    useEffect(() => {
        socket.onmessage = data => {
            let message = JSON.parse(Decompress(data.data))
            if (channelsMap[message.Channel] === undefined) {
                RequestChannelList().then(
                    () => {
                        onMessage(message)
                    }
                )
            }
            else {
                onMessage(message)
            }
        }
    })
    function updateList(index) {
        channels.unshift(channels.splice(index,1)[0])
    }
    function handler(load) {
        update({
            Current: CurrentChannel,
            Channels: channels,
            Content: channelsMap[CurrentChannel],
            LoadOldMessage: load,
        })
    }
    if (token === "0") {
        return <Navigate replace to="/login"/>
    }
    return (
        <div>
            <CurrentChatContext.Provider value = {channelHistory}>
                <div className="Chat">
                    <ConversationList handler={handler}/>
                    <ChatHistory handler={handler}/>
                </div>
            </CurrentChatContext.Provider>
        </div>
    )
}