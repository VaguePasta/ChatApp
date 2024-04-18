import {useContext, useEffect, useRef} from "react";
import "./chatHistory.scss"
import {Message} from "./message";
import {CurrentChatContext} from "../dashboard/dashboard";
export function ChatHistory() {
    const history = useContext(CurrentChatContext)
    const refs = useRef(null)
    useEffect(() => {
        setTimeout(() => refs.current.scrollIntoView());
    }, [history]);
    return (
        <div className="ChatHistory">
            {history.ChannelContent.map(msg => <Message message={msg}/>)}
            <div ref={refs} style={{clear:"both"}}/>
        </div>
    );
}