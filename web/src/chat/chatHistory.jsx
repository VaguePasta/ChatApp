import {useContext, useEffect, useRef, useState} from "react";
import "./chatHistory.scss"
import {Message} from "./message";
import {CurrentChatContext} from "../dashboard/dashboard";
import "../dashboard/dashboard.scss"
import {ChatInfo} from "./chatinfo";
import {ChatBox} from "./chatbox";
import { channelsMap, RequestChat} from "../api/api";
import {CurrentChannel} from "../conversation/conversation";
import {ErrorNotification} from "../dashboard/notifications";
import {Members} from "../chatmenu/members";
import {AnimatePresence, motion} from "framer-motion";
export function ChatHistory(props) {
    const history = useContext(CurrentChatContext)
    const refs = useRef(null)
    const [isOnTop, onTop] = useState(false)
    const [isNotOnBottom, notOnBottom] = useState(false)
    const [replyTo, reply] = useState(0)
    const [showingMember, showMember] = useState(false)
    function showMem(show) {
        showMember(show)
    }
    useEffect(() => {
        onTop(false)
        notOnBottom(false)
        reply(0)
        if (channelsMap[CurrentChannel] === null) {
            channelsMap[CurrentChannel] = []
            RequestChat(CurrentChannel).then(
                () => {
                    props.handler(false, true, true, true)
                },
                () => {
                    ErrorNotification("fetch-message-error", "Cannot connect to server.")
                }
            )
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [history.Current]);
    useEffect(() => {
        if (history.NewMessage) setTimeout(() => refs.current.scrollIntoView());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [history.Content]);
    function ScrollHandler(e) {
        if (e.currentTarget.clientHeight < e.currentTarget.scrollHeight) {
            if (e.currentTarget.scrollTop === 0) {
                onTop(true)
                return
            } else {
                onTop(false)
            }
            if (Math.abs(e.currentTarget.scrollHeight - (e.currentTarget.scrollTop + e.currentTarget.clientHeight)) > 1) {
                notOnBottom(true)
            } else {
                notOnBottom(false)
            }
        }
    }
    function LoadChat() {
        RequestChat(CurrentChannel).then(
            () => {
                onTop(false)
                props.handler(false, false, true, false)
            },
            () => {
                ErrorNotification("fetch-message-error", "Cannot connect to server.")
            }
        )
    }

    function ScrollToBottom() {
        setTimeout(() => refs.current.scrollIntoView());
    }
    return (
        <div style={{
            display: "flex",
            flex: "1",
        }}>
            <div className="ChatWindow">
                <ChatInfo showingMem={showingMember} showMem={showMem} handler={props.handler}/>
                <AnimatePresence>
                    {isOnTop && (<motion.button
                        className="UpDownButton LoadMore"
                        onClick={LoadChat}
                        exit = {{top: 0}}
                        />
                    )}
                </AnimatePresence>
                {history.Content !== null ? <div className="ChatHistory" onScroll={ScrollHandler}>
                        {history.Content.map(msg => msg.Fetch !== true &&
                            <Message key={msg.ID.valueOf()} reply={reply} message={msg} replyTo={replyTo} handler={props.handler}/>)}
                        <div ref={refs} style={{clear: "both"}}/>
                    </div> :
                    <div className="ChatHistory">
                        <div className="loader"/>
                        <div ref={refs} style={{clear: "both", bottom: "0"}}/>
                    </div>}
                <AnimatePresence>
                    {isNotOnBottom && (<motion.button
                        style={{bottom: (replyTo === 0) ? '8%' : '15%'}}
                        onClick = {ScrollToBottom}
                        exit = {{bottom: 0}}
                        transition = {{duration: 0.3}}
                        className={"UpDownButton ScrollToBottom" + (replyTo !== 0 ? " Rep" : ""
                        )}
                    />)}
                </AnimatePresence>
                {CurrentChannel !== 0 && <ChatBox replyingTo={replyTo} reply={reply}/>}
            </div>
            {showingMember && <Members showMem={showMem}/>}
        </div>
    );
}