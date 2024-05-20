import "./message.scss"
import {Tooltip} from "react-tooltip";
import Linkify from "linkify-react";
import {userid} from "../api/api";

export function Message(props) {
    if (props.message.SenderID === userid) {
        return (
            <div style={{background: "#007aff", color:"white", float: "right"}} className="Message">
                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                <a data-tooltip-id="message" data-tooltip-content={props.message.TimeStamp}>
                    <Linkify options={{attributes: {target: "_blank"}}}>
                        {props.message.Text}
                    </Linkify></a>
                <Tooltip id="message"/>
            </div>
        )
    }
    else {
        return (
            <div style={{background: "#f2f2f7", color:"black", float:"left"}} className="Message">
                <div style={{color:"#8f8f92", fontSize:"14px"}}>{props.message.SenderName}</div>
                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                <a data-tooltip-id="message" data-tooltip-content={props.message.TimeStamp}>
                    <Linkify options={{attributes: {target: "_blank"}}}>
                        {props.message.Text}
                    </Linkify></a>
                <Tooltip id="message"/>
            </div>
        )
    }
}