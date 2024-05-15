import {CreateChannel, server, token} from "../api/api";
import {Conversation} from "./conversation";
import "./conversationlist.scss"
import {useRef, useState} from "react";
import Popup from "reactjs-popup";
export let channelsMap = new Map()
export let channels = []
export function RequestChannelList() {
    let conn = new XMLHttpRequest()
    conn.open("GET","http" + server + "channel/" + token,false)
    conn.send()
    channelsMap[0] = []
    if (conn.responseText !== 'null') {
        channels = JSON.parse(conn.responseText)
        channels.forEach((element) => {
            channelsMap[element.ChannelID] = []
        })
    }
    console.log("Requested.")
}
export function ConversationList(props) {
    const ref = useRef()
    const [channelList, updateList] = useState(channels)
    function keyDownHandler(e) {
        if (e.key === 'Enter') {
            e.preventDefault()
            e.stopPropagation()
            if (CreateChannel(e.target.value)) {
                RequestChannelList()
                updateList(channels)
            }
            e.target.value = ''
            ref.current.close()
        }
    }
    return (
        <div className="ConversationList">
            <Popup position="right center" trigger={<button style={{height:"5%",width:"100%"}}>New Chat</button>} ref={ref}>
                <div>
                    <label style={{fontSize:14, marginLeft:5, marginTop:20,marginBottom:10}} onKeyDown={keyDownHandler}>
                        Enter user(s): <input/>
                    </label>
                </div>
            </Popup>
            {channelList.map(channel => <Conversation handler={props.handler} ChannelID={channel.ChannelID} Title={channel.Title}/>)}
        </div>
    )
}