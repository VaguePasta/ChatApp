import {ChatHistory} from "../chat/chatHistory";
import {Navigate, useNavigate} from "react-router-dom";
import {Channel} from "./channel"
import "./dashboard.scss"
import React, {createContext, useEffect, useRef, useState} from "react";
import {CurrentChannel} from "../conversation/conversation";
import Popup from "reactjs-popup";
import {new_message} from "../audio/audio";
import {parse} from "lossless-json";
import {LogOut, socket, User} from "../api/auth";
import {Decompress, GetMessage, SaveMessage} from "../api/message";
import {channels, channelsMap, RequestChannelList, RequestChat} from "../api/channel";
import {Reconnect} from "../notifications/notifications";
export const CurrentChatContext = createContext({Current:0, Channels: [], Content: [], NewMessage: false, LastMessage: false})
const notification_sound = new Audio()
notification_sound.src = new_message
export function Dashboard() {
    const ref = useRef()
    const [, forceRender] = useState(false)
    let history = useNavigate()
    const [channelHistory,update] = useState({Current: 0, Channels: [], Content: [], NewMessage: false, LastMessage: false})
    async function onMessage(message) {
        if (channelsMap[message.Channel.valueOf()] === null) {
            channelsMap[message.Channel.valueOf()] = []
            RequestChat(message.Channel.valueOf()).then()
        }
        if (message.Fetch !== true &&
            message.ReplyTo !== null &&
            message.ReplyTo.valueOf() !== 0 &&
            !channelsMap[message.Channel.valueOf()].some(e => e.ID.valueOf() === message.ReplyTo.valueOf())) {
            await GetMessage(message.ReplyTo.valueOf(), message.Channel.valueOf())
        }
        SaveMessage(message)
        if (message.IsNew === true) {
            delete message.IsNew
            updateList(channels.findIndex((channel) => channel.ChannelID.valueOf() === message.Channel.valueOf()))
            if (message.SenderID.valueOf() !== User.userid) {
                document.title = "ChatApp (•)"
                notification_sound.play().then(() => setTimeout(() => {
                    document.title = "ChatApp"
                }, 2500))
            }
            if (message.Channel.valueOf() === CurrentChannel) {
                handler(false, true, true, true, false)
            } else handler(false, true, false, false, false)
        } else if (message.Channel.valueOf() === CurrentChannel) {
            if (message.IsLast === true) {
                delete message.IsLast
                handler(false, true, true, false, true)
            }
            else handler(false, true, true, false, false)
        }
    }
    useEffect(() => {
        if (socket !== undefined) {
            socket.onmessage = data => {
                let message = parse(Decompress(data.data))
                if (channelsMap[message.Channel.valueOf()] === undefined) {
                    RequestChannelList(false).then(
                        () => {
                            onMessage(message).then()
                        }
                    )
                } else {
                    onMessage(message).then()
                }
            }
            socket.onerror = () => {
                Reconnect(ref).then((result) => {if (result) forceRender(render => !render)})
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
    function handler(c_channel, l_channel, cnt_channel, load, last) {
        update({
            Current: c_channel === true ? CurrentChannel : channelHistory.Current,
            Channels: l_channel === true ? [...channels] : channelHistory.Channels,
            Content: cnt_channel === true ? (channelsMap[CurrentChannel] !== null ? [...channelsMap[CurrentChannel]] : null) : channelHistory.Content,
            NewMessage: load,
            LastMessage: last,
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