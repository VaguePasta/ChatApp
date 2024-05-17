import ChatBox from "../chat/chatbox";
import {ChatHistory} from "../chat/chatHistory";
import {Decompress, RequestChannelList, SaveMessage, socket, token} from "../api/api";
import {Navigate} from "react-router-dom";
import {channels, channelsMap, ConversationList} from "../conversation/conversationlist";
import "./dashboard.scss"
import {createContext, useEffect, useState} from "react";
import {CurrentChannel} from "../conversation/conversation";
export const CurrentChatContext = createContext({Current:0, Channels: [], Content: []})
export function Dashboard() {
    const [channelHistory,update] = useState({Current: 0, Channels: [], Content: []})
    useEffect(() => {
        socket.onmessage = data => {
            let message = JSON.parse(Decompress(data.data))
            if (channelsMap[message.Channel] === undefined) {
                RequestChannelList()
                handler()
            }
            SaveMessage(message)
            if (message.Channel === CurrentChannel) {
                handler()
            }
            if (message.Type === false) updateList(channels.findIndex((channel) => channel.ChannelID === message.Channel))
        }
    })
    function updateList(index) {
        channels.unshift(channels.splice(index,1)[0])
    }
    function handler() {
        update({
            Current: CurrentChannel,
            Channels: channels,
            Content: channelsMap[CurrentChannel]
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
                    <ChatHistory/>
                </div>
                <ChatBox/>
            </CurrentChatContext.Provider>
        </div>
    )
}