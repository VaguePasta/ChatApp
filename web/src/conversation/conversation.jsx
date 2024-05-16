import "./conversation.scss"
import {createRef} from "react";
import {server, token} from "../api/api";
import {channelsMap} from "./conversationlist";
export let CurrentChannel = 0;
export function RequestChat(CurrentChannel) {
    let request = new XMLHttpRequest()
    request.open("GET", "http" + server + "message/" + token + "/" + CurrentChannel, true)
    request.send()
}

export function Conversation(props) {
    let thisButton = createRef()
    function ChooseChannel() {
        CurrentChannel = props.ChannelID
        if (channelsMap[CurrentChannel].length === 0) {
            RequestChat(CurrentChannel)
        }
        props.handler()
    }
    return (
            <button className="Conversation" onClick={ChooseChannel} ref={thisButton}>{props.Title}</button>
    )
}