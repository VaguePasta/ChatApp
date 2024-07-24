import {createRef, useEffect, useState} from "react";
import "./chatbox.scss"
import {channelsMap, send, User} from "../api/api"
import {CurrentChannel} from "../conversation/conversation";
import autosize from "autosize/dist/autosize";
import Popup from "reactjs-popup";
import {ErrorNotification} from "../dashboard/notifications";
import {stringify} from "lossless-json";
export function ChatBox(props) {
    let chat = document.querySelector('textarea')
    let chatBoxRef = createRef()
    const [textReply, textRep] = useState(undefined)
    useEffect(() => {
        if (props.replyingTo !== 0 && channelsMap[CurrentChannel] !== null) {
            textRep(channelsMap[CurrentChannel].find(e => e.ID.valueOf() === props.replyingTo))
        }
    }, [props]);
    function sendHandler() {
        if (chatBoxRef.current.value !== '') {
            send(stringify({channel:CurrentChannel,type:'text',content:chatBoxRef.current.value, reply: props.replyingTo}))
            chatBoxRef.current.value = ''
            chatBoxRef.current.focus()
            autosize.update(chat)
            if (props.replyingTo !== 0) props.reply(0)
        }
    }
    function keyDownHandler(e) {
        if (e.key === 'Enter' && !e.shiftKey && chatBoxRef.current.value !== '') {
            e.preventDefault()
            e.stopPropagation()
            send(stringify({channel:CurrentChannel,type:'text',content:chatBoxRef.current.value, reply: props.replyingTo}))
            e.target.value = ''
            chatBoxRef.current.focus()
            autosize.update(chat)
            if (props.replyingTo !== 0) props.reply(0)
        }
    }
    autosize(chat)
    async function SendImage(e) {
        if (e.key === 'Enter' && e.target.value !== "") {
            if (await ImageExists(e.target.value)) {
                send(stringify({channel:CurrentChannel,type:'image',content:e.target.value, reply: props.replyingTo}))
            }
            else {
                ErrorNotification("image-error", "Invalid link.")
            }
        }
    }
    async function ImageExists(url) {
        return await new Promise((resolve) => {
            const image = new Image()
            image.src = url
            image.onload = () => resolve(true)
            image.onerror = () => resolve(false)
        })
    }

    function SendVideo(e) {
        if (e.key === 'Enter' && e.target.value !== "") {
            const regex = '^.*(?:(?:youtu.be/|v/|vi/|u/w/|embed/)|(?:(?:watch)??v(?:i)?=|&v(?:i)?=))([^#&?]+).*';
            const match = e.target.value.match(regex);
            if (match === null) {
                ErrorNotification("video-error", "Not a Youtube video.")
                return
            }
            send(stringify({channel:CurrentChannel,type:'video',content:match[1], reply: props.replyingTo}))
            e.target.value = ''
        }
    }
    return (
        <div style={{zIndex: "3", borderTop: props.replyingTo !== 0 ? "1px solid black" : "none"}}>{props.replyingTo !== 0 && textReply !== undefined &&
            <ReplyingTo message={textReply} removeReply={props.reply}/>}
            <div style={{background:"white", height:"max-content", width:"100%", display:"flex", alignItems:"center"}}>
                <textarea placeholder="Aa" ref={chatBoxRef} className="ChatBox" onKeyDown={keyDownHandler}/>
                <Popup position="top right" trigger={<button className="FunctionButton ImageButton"></button>}>
                    <input className="Input" onKeyDown={SendImage}/>
                </Popup>
                <Popup position="top right" trigger={<button className="FunctionButton VideoButton"></button>}>
                    <input className="Input" onKeyDown={SendVideo}/>
                </Popup>
                <button className="FunctionButton SendButton" onClick={sendHandler}/>
            </div>
        </div>
    )
}
function ReplyingTo(props) {
    if (props.message.Type === 'text') {
        return (
            <div style={{display: "flex", alignItems:"center"}}>
                <div style={{
                    margin: "2px 5px 0 5px",
                    display: '-webkit-box',
                    WebkitBoxOrient: 'vertical',
                    WebkitLineClamp: 2,
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                }}>Replying to {props.message.SenderID.valueOf() === User.userid ? 'myself' : props.message.SenderName}
                    <div style={{color: "gray"}}>
                        {props.message.Text}
                    </div>
                </div>
                <button onClick={() => props.removeReply(0)} className="RemoveButton"/>
            </div>
        )
    } else if (props.message.Type === 'image') {
        return (
            <div style={{display: "flex", alignItems: "center"}}>
                <div style={{
                    margin: "2px 5px 0 5px",
                    display: '-webkit-box',
                    WebkitBoxOrient: 'vertical',
                    WebkitLineClamp: 2,
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "pre",
                }}>Replying to {props.message.SenderID.valueOf() === User.userid ? 'myself' : props.message.SenderName}
                    <div style={{color: "gray"}}>
                        Image: <a href={props.message.Text} target="_blank" rel="noreferrer"> {props.message.Text}</a>
                    </div>
                </div>
                <button onClick={() => props.removeReply(0)} className="RemoveButton"/>
            </div>
        )
    } else if (props.message.Type === 'video') {
        return (
            <div style={{display: "flex", alignItems: "center"}}>
                <div style={{
                    margin: "2px 5px 0 5px",
                    display: '-webkit-box',
                    WebkitBoxOrient: 'vertical',
                    WebkitLineClamp: 2,
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "pre",
                }}>Replying to {props.message.SenderID.valueOf() === User.userid ? 'myself' : props.message.SenderName}
                    <div style={{color: "gray"}}>
                        Video: <a target="_blank" href={"https://www.youtube.com/watch?v=" + props.message.Text}
                                  rel="noreferrer">{"https://www.youtube.com/watch?v=" + props.message.Text}</a>
                    </div>
                </div>
                <button onClick={() => props.removeReply(0)} className="RemoveButton"/>
            </div>
        )
    }
}