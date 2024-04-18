import {server, token} from "../api/api";
import {Conversation} from "./conversation";
import "./conversationlist.scss"
import {useEffect, useState} from "react";
export let channelsMap = new Map()
export let channels = []
export function RequestChannelList() {
    let conn = new XMLHttpRequest()
    conn.open("GET","http" + server + "channel/" + token,false)
    conn.send()
    channels = JSON.parse(conn.responseText)
    channels.forEach((element) => {
        channelsMap[element.ChannelID] = []
    })
}
export function ConversationList(props) {
    const [channelList, updateList] = useState(props.list)
    useEffect(() => {
        updateList(props.list)
    }, [props.list]);
    return (
        <div className="ConversationList">{channelList.map(channel => <Conversation handler={props.handler} ChannelID={channel.ChannelID} Title={channel.Title}/>)}</div>
    )
}