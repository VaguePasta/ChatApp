import {ChatHistory} from "../chat/chatHistory";
import {
    channels,
    channelsMap,
    Decompress,
    LogOut,
    RequestChannelList,
    RequestChat,
    SaveMessage,
    socket, User,
} from "../api/api";
import {Navigate, useNavigate} from "react-router-dom";
import {Channel} from "./channel"
import "./dashboard.scss"
import React, {createContext, useEffect, useRef, useState} from "react";
import {CurrentChannel} from "../conversation/conversation";
import Popup from "reactjs-popup";
import {new_message} from "../audio/audio";
import {parse} from "lossless-json";
export const CurrentChatContext = createContext({Current:0, Channels: [], Content: [], NewMessage: false})
const notification_sound = new Audio()
notification_sound.src = new_message
export function Dashboard() {
    const ref = useRef()
    let history = useNavigate()
    const [channelHistory,update] = useState({Current: 0, Channels: [], Content: [], NewMessage: false})
    function onMessage(message) {
        if (channelsMap[message.Channel.valueOf()] === null) {
            channelsMap[message.Channel.valueOf()] = []
            RequestChat(message.Channel.valueOf()).then()
        }
        SaveMessage(message)
        if (message.IsNew === true) {
            updateList(channels.findIndex((channel) => channel.ChannelID.valueOf() === message.Channel.valueOf()))
            if (message.SenderID.valueOf() !== User.userid) {
                document.title = "ChatApp (•)"
                notification_sound.play().then(setTimeout(() => {document.title = "ChatApp"}, 2500))
            }
            if (message.Channel.valueOf() === CurrentChannel) {
                handler(false, true, true, true)
            }
            else handler(false, true, false, false)
        }
        else if (message.Channel.valueOf() === CurrentChannel) {
            handler(false, true, true, false)
        }
    }
    useEffect(() => {
        if (socket !== undefined) {
            socket.onmessage = data => {
                let message = parse(Decompress(data.data))
                if (channelsMap[message.Channel.valueOf()] === undefined) {
                    RequestChannelList().then(
                        () => {
                            onMessage(message)
                        }
                    )
                } else {
                    onMessage(message)
                }
            }
            socket.onerror = () => {
                ref.current.open()
            }
        }
    })
    function updateList(index) {
        channels.unshift(channels.splice(index,1)[0])
    }
    function connectionLost() {
        LogOut()
        history("/login", {replace: true})
    }
    function handler(c_channel, l_channel, cnt_channel, load) {
        update({
            Current: c_channel !== false ? CurrentChannel : channelHistory.Current,
            Channels: l_channel !== false ? [...channels] : channelHistory.Channels,
            Content: cnt_channel !== false ? (channelsMap[CurrentChannel] !== null ? [...channelsMap[CurrentChannel]] : null) : channelHistory.Content,
            NewMessage: load,
        })
    }
    if (User.token === "0") {
        return <Navigate replace to="/login"/>
    }
    return (
        <div>
            <Popup ref={ref} modal onClose={connectionLost} className="error-popup">
                Connection to server lost. Please log in again.
                <button style={{flex: "1", minWidth: "40%", margin: "5px"}}
                        onClick={() => ref.current.close()}>OK</button>
            </Popup>
            <CurrentChatContext.Provider value={channelHistory}>
                <div className="Chat">
                    <Channel handler={handler}/>
                    <ChatHistory handler={handler}/>
                </div>
            </CurrentChatContext.Provider>

        </div>
    )
}