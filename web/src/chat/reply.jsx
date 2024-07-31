import {CurrentChannel} from "../conversation/conversation";
import {useState} from "react";
import {channelsMap} from "../api/channel";

export function Reply(props) {
    const [message,] = useState(channelsMap[CurrentChannel].find((e) => e.ID.valueOf() === props.ID))
    return (
        <div style={{
            background: "white",
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
            maxWidth: "89%",
            borderRadius: "5px 7px",
        }}>
            {props.ID !== 0 && message !== undefined && message.Type !== null && <div style={{fontSize: "14px", color: "#8f8f92"}}>{message.SenderName}</div>}
            {(message !== undefined && message.Type !== null && props.ID !== 0) ?
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
                <img alt={props.message.Text} src={props.message.Text} style={{wordWrap:"anywhere", background: "white", margin: "3px 0 -6px 0", maxWidth: "300px", width: "100%"}}/>
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