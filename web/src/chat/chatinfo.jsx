import {useContext, useEffect, useState} from "react";
import {channels} from "../conversation/conversationlist";
import "./chatinfo.scss"
import {CurrentChannel} from "../conversation/conversation";
import {CurrentChatContext} from "../dashboard/dashboard";
export function ChatInfo() {
    const currentChat = useContext(CurrentChatContext)
    const [channelName, changeName] = useState("")
    useEffect(() => {
        if (CurrentChannel === 0) return
        changeName(channels.find(obj => {
            return obj.ChannelID === CurrentChannel
        }).Title)
    }, [currentChat]);
    return (
        <div className="ChatInfo">{channelName}</div>
    )
}