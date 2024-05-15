import {useContext, useEffect, useRef} from "react";
import "./chatHistory.scss"
import {Message} from "./message";
import {CurrentChatContext} from "../dashboard/dashboard";
import {ChatInfo} from "./chatinfo";
export function ChatHistory() {
    const history = useContext(CurrentChatContext)
    const refs = useRef(null)
    useEffect(() => {
        setTimeout(() => refs.current.scrollIntoView());
    }, [history]);
    return (
        <div className="ChatWindow">
            <ChatInfo></ChatInfo>
            <div className="ChatHistory">
                {history.Content.map(msg => <Message message={msg}/>)}
                <div ref={refs} style={{clear:"both"}}/>
            </div>
        </div>
    );
}