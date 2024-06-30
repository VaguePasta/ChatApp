import {useContext, useEffect, useRef} from "react";
import "./chatHistory.scss"
import {Message} from "./message";
import {CurrentChatContext} from "../dashboard/dashboard";
import {ChatInfo} from "./chatinfo";
import ChatBox from "./chatbox";
import {RequestChat} from "../api/api";
import {CurrentChannel} from "../conversation/conversation";
export function ChatHistory(props) {
    const history = useContext(CurrentChatContext)
    const refs = useRef(null)
    useEffect(() => {
        if (!history.LoadOldMessage) setTimeout(() => refs.current.scrollIntoView());
    }, [history]);
    function ScrollHandler(e) {
        console.log("Scrolling")
        if (e.currentTarget.scrollTop === 0) {
            RequestChat(CurrentChannel)
        }
    }
    return (
        <div className="ChatWindow">
            <ChatInfo handler={props.handler}></ChatInfo>
            <div className="ChatHistory" onScroll={ScrollHandler}>
                {history.Content.map(msg => <Message message={msg}/>)}
                <div ref={refs} style={{clear:"both"}}/>
            </div>
            <ChatBox/>
        </div>
    );
}