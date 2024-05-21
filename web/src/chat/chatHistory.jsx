import {useContext, useEffect, useRef} from "react";
import "./chatHistory.scss"
import {Message} from "./message";
import {CurrentChatContext} from "../dashboard/dashboard";
import {ChatInfo} from "./chatinfo";
import ChatBox from "./chatbox";
export function ChatHistory(props) {
    const history = useContext(CurrentChatContext)
    const refs = useRef(null)
    useEffect(() => {
        setTimeout(() => refs.current.scrollIntoView());
    }, [history]);
    return (
        <div className="ChatWindow">
            <ChatInfo handler={props.handler}></ChatInfo>
            <div className="ChatHistory">
                {history.Content.map(msg => <Message message={msg}/>)}
                <div ref={refs} style={{clear:"both"}}/>
            </div>
            <ChatBox/>
        </div>
    );
}