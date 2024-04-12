import {useContext} from "react";
import "./chatHistory.scss"
import {Message} from "./message";
import {CurrentChatContext} from "../dashboard/dashboard";
import {channelsMap} from "../conversation/conversationlist";
export function ChatHistory() {
    let channel = useContext(CurrentChatContext)
    if (channel === undefined) {
        channel = {Channel: 0, ChannelContent: []}
    }
    let history = channelsMap[channel.Channel]
    if (history === undefined) history = []
    return (
        <div className="ChatHistory">
            {history.map(msg => <Message message={msg} />)}
        </div>
    );
}