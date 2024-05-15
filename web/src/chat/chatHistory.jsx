import {useContext, useEffect, useRef} from "react";
import "./chatHistory.scss"
import {Message} from "./message";
import {CurrentChatContext} from "../dashboard/dashboard";
import {channelsMap} from "../conversation/conversationlist";
import {CurrentChannel} from "../conversation/conversation";
export function ChatHistory() {
    const history = useContext(CurrentChatContext)
    const refs = useRef(null)
    useEffect(() => {
        setTimeout(() => refs.current.scrollIntoView());
    }, [history]);
    return (
        <div className="ChatHistory">
            {channelsMap[CurrentChannel].map(msg => <Message message={msg}/>)}
            <div ref={refs} style={{clear:"both"}}/>
        </div>
    );
}