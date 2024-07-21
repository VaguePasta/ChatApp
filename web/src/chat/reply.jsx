import {CurrentChannel} from "../conversation/conversation";
import {channelsMap, GetMessage} from "../api/api";
import {useState} from "react";

export function Reply(props) {
    const [loaded, load] = useState(false)
    const [message, replyTo] = useState(null)
    if (message === null && !loaded) {
        GetMessage(props.ID, CurrentChannel).then(() => {
            replyTo(channelsMap[CurrentChannel].find(element => element.ID === props.ID))
            load(true)
        })
    }
    if (message === null) {
        return (
            <div style={{color: "gray", fontStyle: "italic"}}>Loading.....</div>
        )
    }
    return (
        <div style={{
            background: "transparent",
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 3,
            textOverflow: "ellipsis",
            overflow: "hidden",
            padding: "3px 2px",
            border: "solid 1px #8f8f92",
            fontSize: "15px",
            margin: `${props.margin}`,
            zIndex: "1",
            maxWidth: "fit-content",
            borderRadius: "5px 7px"
        }}>
            {message !== undefined && message.Type !== null && <div style={{fontSize: "14px", color: "#8f8f92"}}>{message.SenderName}</div>}
            {(message !== undefined && message.Type !== null) ?
                <ReplyContent style={{color: "gray", maxWidth: "fit-content"}} message={message}/> :
            <div style={{color: "gray"}}>Message not available.</div>
        }
        </div>
    )
}

function ReplyContent(props) {
    if (props.message.Type === 'text') {
        return (
            <div style={{color: "gray"}}>
                {props.message.Text}
            </div>
        )
    }
    else if (props.message.Type === 'image') {
        return (
                <img alt={props.message.ID} src={props.message.Text} style={{margin: "3px -3px -6px -3px", maxWidth: "300px"}}/>
        )
    }
    else if (props.message.Type === 'video') {
        return (
            <div style={{color: "gray"}}>
                <a target="_blank" href={"https://www.youtube.com/watch?v=" + props.message.Text} rel="noreferrer">{"https://www.youtube.com/watch?v=" + props.message.Text}</a>
            </div>
        )
    }
}