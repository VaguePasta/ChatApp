import {CurrentChannel} from "../conversation/conversation";
import {channelsMap, GetMessage} from "../api/api";
import {useState} from "react";

export function Reply(props) {
    const [message, getMessage] = useState(channelsMap[CurrentChannel].find(element => element.ID === props.ID))
    if (message === undefined) {
        GetMissingMessage().then(() => getMessage(channelsMap[CurrentChannel].find(element => element.ID === props.ID)))
    }
    async function GetMissingMessage() {
        await GetMessage(props.ID)
    }
    if (message === undefined) {
        return (
            <div>
                Error loading message.
            </div>
        )
    }
    else return (
        <div style={{
            background:"transparent",
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 3,
            minWidth: "0px",
            textOverflow:"ellipsis",
            overflow: "hidden",
            maxWidth: "fit-content",
            padding:"3px 2px",
            border: "solid 1px #8f8f92",
            fontSize:"15px",
            margin: `${props.margin}`,
            borderRadius:"5px 7px"}}>
            <div style={{fontSize:"14px", color:"#8f8f92"}}>Replying to {message.SenderName}</div>
            <div style={{color:"gray"}}>{message.Text}</div>
        </div>
    )
}