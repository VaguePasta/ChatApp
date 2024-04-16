import ChatBox from "../chat/chatbox";
import {ChatHistory} from "../chat/chatHistory";
import {SaveMessage, socket, token} from "../api/api";
import {Navigate} from "react-router-dom";
import {channelsMap, ConversationList} from "../conversation/conversationlist";
import "./dashboard.scss"
import {createContext, useEffect, useState} from "react";
import {CurrentChannel} from "../conversation/conversation";
export const CurrentChatContext = createContext({Channel:0,ChannelContent:[]})
export function Dashboard() {
    const [channelHistory,update] = useState({
        Channel: 0,
        ChannelContent: []
    })
    useEffect(() => {
        socket.onmessage = data => {
            let message = JSON.parse(data.data)
            SaveMessage(message)
            if (message.Channel === CurrentChannel) {
                handler()
            }
        }
    })
    function handler() {
        update({
            Channel: CurrentChannel,
            ChannelContent: channelsMap[CurrentChannel]
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