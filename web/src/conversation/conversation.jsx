import "./conversation.scss"
import {createRef} from "react";
import {server, token} from "../api/api";
import {channelsMap} from "./conversationlist";
export let CurrentChannel = 0;
function RequestChat(CurrentChannel) {
    if (channelsMap[CurrentChannel] === undefined) {
        let request = new XMLHttpRequest()
        request.open("GET", "http" + server + "message/" + token + "/" + CurrentChannel, false)
        request.send()
    }
}

export function Conversation(props) {
    let thisButton = createRef()
    function ChooseChannel() {
        CurrentChannel = props.ChannelID
        RequestChat(CurrentChannel)
        props.handler()
    }
    return (
            <button className="Conversation" onClick={ChooseChannel} ref={thisButton}>{props.Title}</button>
    )
}