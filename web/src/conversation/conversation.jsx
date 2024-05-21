import "./conversation.scss"
import {createRef} from "react";
import {channelsMap, RequestChat} from "../api/api";
export let CurrentChannel = 0;
export function SetChannel(channel) {
    CurrentChannel = channel
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
        CurrentChannel === props.ChannelID ?
            <button className="ActiveConversation" onClick={ChooseChannel} ref={thisButton}>{props.Title}</button>
            : <button className="Conversation" onClick={ChooseChannel} ref={thisButton}>{props.Title}</button>
    )
}