import "./message.scss"
import {Tooltip} from "react-tooltip";
import {userid} from "../api/api";
import Linkify from "linkify-react";

export function Message(props) {
    return (
        <div>
            {props.message.Sender === userid
                ? (
                    // eslint-disable-next-line jsx-a11y/anchor-is-valid
                    <a data-tooltip-id="message" style={{float:"right", background:"#11a2da"}} data-tooltip-content={props.message.TimeStamp} className="Message"><Linkify options={{attributes:{target:"_blank"}}}>{props.message.Text}</Linkify></a>
                ) : (
                    // eslint-disable-next-line jsx-a11y/anchor-is-valid
                    <a data-tooltip-id="message" style={{float:"left", background:"#00ab41"}} data-tooltip-content={props.message.TimeStamp} className="Message"><Linkify options={{attributes:{target:"_blank"}}}>{props.message.Text}</Linkify></a>
                )}
                <Tooltip id="message"/>
        </div>
    )
}