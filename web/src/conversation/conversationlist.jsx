import {server, token} from "../api/api";
import {Conversation} from "./conversation";
import "./conversationlist.scss"
import {useEffect, useState} from "react";
import Popup from "reactjs-popup";
export let channelsMap = new Map()
export let channels = []
export function RequestChannelList() {
    let conn = new XMLHttpRequest()
    conn.open("GET","http" + server + "channel/" + token,false)
    conn.send()
    if (conn.responseText !== 'null') {
        channels = JSON.parse(conn.responseText)
        channels.forEach((element) => {
            channelsMap[element.ChannelID] = []
        })
    }
}
export function ConversationList(props) {
    const [channelList, updateList] = useState(props.list)
    useEffect(() => {
        updateList(props.list)
    }, [props.list]);
    return (
        <div className="ConversationList">
            <Popup position="right center" trigger={<button style={{height:"5%",width:"100%"}}>New Chat</button>}>
                <div>
                    <label style={{fontSize:14, marginLeft:5, marginTop:20,marginBottom:10}}>
                        Enter user(s): <input/>
                    </label>
                </div>
            </Popup>
            {channelList.map(channel => <Conversation handler={props.handler} ChannelID={channel.ChannelID} Title={channel.Title}/>)}
        </div>
    )
}