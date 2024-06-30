import "./message.scss"
import {Tooltip} from "react-tooltip";
import Linkify from "linkify-react";
import {userid} from "../api/api";

export function Message(props) {
    if (props.message.SenderID === userid) {
        if (props.message.Type === 'text') {
            return (
                <div style={{background: "#007aff", color: "white", float: "right"}} className="Message">
                    {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                    <a data-tooltip-id="message" data-tooltip-content={props.message.TimeStamp}>
                        <Linkify options={{attributes: {target: "_blank"}}}>
                            {props.message.Text}
                        </Linkify></a>
                    <Tooltip id="message"/>
                </div>
            )
        }
        else if (props.message.Type === 'image') {
            return (
            <div style={{float: "right", display:"block", maxWidth:"35%", clear:"both", margin:"5px 10px"}}>
                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                <a data-tooltip-id="message" data-tooltip-content={props.message.TimeStamp}>
                    <img alt={props.message.ID} src={props.message.Text} style={{width:"100%"}}></img>
                </a>
                <Tooltip id="message"/>
            </div>
            )
        }
        else if (props.message.Type === 'video') {
            let src = "https://www.youtube.com/embed/" + props.message.Text
            return (
                <div style={{float: "right", display:"block", clear:"both", margin:"5px 10px"}}>
                    <iframe src={src} width="560px" height="315px"
                            title="YouTube video player"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
                </div>
            )
        }
    } else {
        if (props.message.Type === 'text') {
            return (
                <div style={{background: "#f2f2f7", color: "black", float: "left"}} className="Message">
                    <div style={{color: "#8f8f92", fontSize: "14px"}}>{props.message.SenderName}</div>
                    {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                <a data-tooltip-id="message" data-tooltip-content={props.message.TimeStamp}>
                    <Linkify options={{attributes: {target: "_blank"}}}>
                        {props.message.Text}
                    </Linkify></a>
                <Tooltip id="message"/>
            </div>
            )
        }
        else if (props.message.Type === 'image') {
            return (
            <div style={{float: "left", display: "block", maxWidth: "35%", clear: "both", margin: "5px 10px"}}>
                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                <a data-tooltip-id="message" data-tooltip-content={props.message.TimeStamp}>
                    <img alt={props.message.ID} src={props.message.Text} style={{width: "100%"}}></img>
                </a>
                <Tooltip id="message"/>
            </div>
            )
        }
        else if (props.message.Type === 'video') {
            let src = "https://www.youtube.com/embed/" + props.message.Text
            return (
                <div style={{float: "left", display:"block", clear:"both", margin:"5px 10px"}}>
                    <iframe src={src} width="560px" height="315px"
                            title="YouTube video player"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
                </div>
            )
        }
    }
}