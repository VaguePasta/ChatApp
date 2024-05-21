import {createRef} from "react";
import "./chatbox.scss"
import {send} from "../api/api"
import {CurrentChannel} from "../conversation/conversation";
export function ChatBox() {
    let chatBoxRef = createRef()
    function sendHandler() {
        if (chatBoxRef.current.value !== '') {
            send(JSON.stringify({channel:CurrentChannel,content:chatBoxRef.current.value}))
            chatBoxRef.current.value = ''
            chatBoxRef.current.focus()
        }
    }
    function keyDownHandler(e) {
        if (e.key === 'Enter' && !e.shiftKey && chatBoxRef.current.value !== '') {
            e.preventDefault()
            e.stopPropagation()
            send(JSON.stringify({channel:CurrentChannel,content:chatBoxRef.current.value}))
            e.target.value = ''
            chatBoxRef.current.focus()
        }
    }
    return (
        <div style={{background:"white", height:"max-content", width:"100%", display:"flex", alignItems:"center"}}>
            <textarea ref={chatBoxRef} className="ChatBox" onKeyDown={keyDownHandler}/>
            <button className="SendButton" onClick={sendHandler}/>
        </div>
    )
}
export default ChatBox;