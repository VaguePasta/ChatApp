import "./message.scss"
import {Tooltip} from "react-tooltip";
import {userid} from "../api/api";

export function Message(props) {
    return (
        <div>
            {props.message.Sender === userid
                ? (
                    // eslint-disable-next-line jsx-a11y/anchor-is-valid
                    <a data-tooltip-id="message" style={{float:"right"}} data-tooltip-content={props.message.TimeStamp} className="Message">{props.message.Text}</a>
                ) : (
                    // eslint-disable-next-line jsx-a11y/anchor-is-valid
                    <a data-tooltip-id="message" style={{float:"left"}} data-tooltip-content={props.message.TimeStamp} className="Message">{props.message.Text}</a>
                )}
                <Tooltip id="message"/>
        </div>
    )
}