import {useContext} from "react";
import "./chatHistory.scss"
import {Message} from "./message";
import {CurrentChatContext} from "../dashboard/dashboard";
import {channelsMap} from "../conversation/conversationlist";
export function ChatHistory() {
    let channel = useContext(CurrentChatContext)
    let history = channelsMap[channel]
    if (history === undefined) history = []
    return (
            <div className="ChatHistory">
                {history.map(msg => <Message message={msg} />)}
            </div>
    );
}