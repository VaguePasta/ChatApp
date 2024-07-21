import {ChatHistory} from "../chat/chatHistory";
import {channels, channelsMap, Decompress, LogOut, RequestChannelList, SaveMessage, socket, user} from "../api/api";
import {Navigate, useNavigate} from "react-router-dom";
import {User} from "./user"
import "./dashboard.scss"
import React, {createContext, useEffect, useRef, useState} from "react";
import {CurrentChannel} from "../conversation/conversation";
import Popup from "reactjs-popup";
export const CurrentChatContext = createContext({Current:0, Channels: [], Content: [], NewMessage: false})
export function Dashboard() {
    const ref = useRef()
    let history = useNavigate()
    const [channelHistory,update] = useState({Current: 0, Channels: [], Content: [], NewMessage: false})
    function onMessage(message) {
        if (channelsMap[message.Channel] === null) {
            channelsMap[message.Channel] = []
        }
        SaveMessage(message)
        if (message.IsNew === true) {
            updateList(channels.findIndex((channel) => channel.ChannelID === message.Channel))
            if (message.Channel === CurrentChannel) handler(false, true, true, true)
            else handler(false, true, false, false)
        }
        else if (message.Channel === CurrentChannel) {
            handler(false, true, true, false)
        }
    }
    useEffect(() => {
        socket.onmessage = data => {
            let message = JSON.parse(Decompress(data.data))
            if (channelsMap[message.Channel] === undefined) {
                RequestChannelList().then(
                    () => {
                        onMessage(message)
                    }
                )
            }
            else {
                onMessage(message)
            }
        }
        socket.onerror = () => {
            if (user.token !== "0") {
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
    if (user.token === "0") {
        return <Navigate replace to="/login"/>
    }
    return (
        <div>
            <Popup ref={ref} modal onClose={connectionLost} className="error-popup">
                Connection to server lost. Please log in again.
                <button style={{flex:"1", minWidth:"40%", margin:"5px"}} onClick={()=>ref.current.close()}>OK</button>
            </Popup>
            <CurrentChatContext.Provider value = {channelHistory}>
                <div className="Chat">
                    <User handler={handler}/>
                    <ChatHistory handler={handler}/>
                </div>
            </CurrentChatContext.Provider>
        </div>
    )
}