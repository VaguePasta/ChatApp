import {useContext, useEffect, useRef, useState} from "react";
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
    const [isOnTop, onTop] = useState(false)
    const [replyTo, reply] = useState(0)
    useEffect(() => {
        reply(0)
        if (!history.LoadOldMessage) setTimeout(() => refs.current.scrollIntoView());
    }, [history]);
    function ScrollHandler(e) {
        if (e.currentTarget.scrollTop === 0) {
            onTop(true)
        }
        else {
            onTop(false)
        }
    }
    function LoadChat() {
        RequestChat(CurrentChannel)
        onTop(false)
    }
    return (
        <div className="ChatWindow">
            <ChatInfo handler={props.handler}></ChatInfo>
            <div className="ChatHistory" onScroll={ScrollHandler}>
                {isOnTop && <button onClick={LoadChat} className="LoadMore"/>}
                {history.Content.map(msg => <Message key={msg.ID} reply={reply} message={msg} handler={props.handler}/>)}
                <div ref={refs} style={{clear: "both"}}/>
            </div>
            {CurrentChannel !== 0 && <ChatBox replyingTo={replyTo} reply={reply}/>}
        </div>
    );
}