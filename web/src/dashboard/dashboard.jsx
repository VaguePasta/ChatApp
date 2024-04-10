import ChatBox from "../chat/chatbox";
import {ChatHistory} from "../chat/chatHistory";
import {token} from "../api/api";
import {Navigate} from "react-router-dom";
import {ConversationList} from "../conversation/conversationlist";
import "./dashboard.scss"
import {createContext, useContext, useState} from "react";
import {CurrentChannel} from "../conversation/conversation";
export const CurrentChatContext = createContext(0)
export function Dashboard() {
    const [channel,update] = useState(CurrentChannel)
    function handler() {
        update(CurrentChannel)
    }
    if (token === "0") {
        return <Navigate replace to="/login"/>
    }
    return (
        <div>
            <CurrentChatContext.Provider value = {channel}>
                <div className="Chat">
                    <ConversationList handler={handler}/>
                    <ChatHistory/>
                </div>
                <ChatBox/>
            </CurrentChatContext.Provider>
        </div>
    )
}