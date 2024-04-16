import {server, token} from "../api/api";
import {Conversation} from "./conversation";
import "./conversationlist.scss"
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
    return (
        <div className="ConversationList">{channels.map(channel => <Conversation handler={props.handler} ChannelID={channel.ChannelID} Title={channel.Title}/>)}</div>
    )
}