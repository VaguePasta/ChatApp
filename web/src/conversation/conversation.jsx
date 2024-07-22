import "./conversation.scss"
import {createRef} from "react";
export let CurrentChannel = 0;
export function SetChannel(channel) {
    CurrentChannel = channel
}
export function Conversation(props) {
    let thisButton = createRef()
    function ChooseChannel() {
        CurrentChannel = props.ChannelID
        props.handler(true, false, true, true)
    }
    return (
        CurrentChannel === props.ChannelID ?
            <button className="ActiveConversation" ref={thisButton}>{props.Title}</button>
            : <button className="Conversation" onClick={ChooseChannel} ref={thisButton}>{props.Title}</button>
    )
}