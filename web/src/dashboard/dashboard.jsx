import {ChatHistory} from "../chat/chatHistory";
import {channels, channelsMap, Decompress, LogOut, RequestChannelList, SaveMessage, socket, token} from "../api/api";
import {Navigate, useNavigate} from "react-router-dom";
import {User} from "./user"
import "./dashboard.scss"
import React, {createContext, useEffect, useRef, useState} from "react";
import {CurrentChannel} from "../conversation/conversation";
import Popup from "reactjs-popup";
import {ToastContainer} from "react-toastify";
export const CurrentChatContext = createContext({Current:0, Channels: [], Content: [], LoadOldMessage: false})
export function Dashboard() {
    const ref = useRef()
    let history = useNavigate()
    const [channelHistory,update] = useState({Current: 0, Channels: [], Content: [], LoadOldMessage: false})
    function onMessage(message) {
        SaveMessage(message)
        if (message.isNew === true) {
            updateList(channels.findIndex((channel) => channel.ChannelID === message.Channel))
            if (message.Channel === CurrentChannel) {
                handler(false)
            }
        }
        else if (message.Channel === CurrentChannel) {
            handler(true)
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
            if (token !== "0") {
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
    function handler(load) {
        update({
            Current: CurrentChannel,
            Channels: channels,
            Content: channelsMap[CurrentChannel],
            LoadOldMessage: load,
        })
    }
    if (token === "0") {
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
            <ToastContainer autoClose={3500} limit={5}/>
        </div>
    )
}