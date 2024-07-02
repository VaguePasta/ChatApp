import "./message.scss"
import {Tooltip} from "react-tooltip";
import {DeleteMessage, removeMessage, userid} from "../api/api";
import Linkify from "react-linkify";
import {useRef, useState} from "react";
export function Message(props) {
    const messageRef = useRef(null)
    const [isDeleted, deleteMessage] = useState(false)
    function showOptions() {
        messageRef.current.style.visibility = 'visible'
    }
    function hideOptions() {
        messageRef.current.style.visibility = 'hidden'
    }

    async function Delete() {
        if (await DeleteMessage(props.message.ID)) {
            removeMessage(props.message.Channel, props.message.ID)
            deleteMessage(true)
        }
    }
    if (isDeleted && props.message.SenderID === userid) {
        return (
            <div style={{
                float: "right",
                display: "flex",
                clear: "both",
                maxWidth: "55%",
                margin: "5px 10px",
                alignItems: "center"
            }}>
                <div style={{background: "transparent", color: "black", border:"solid 1px"}} className="Message">
                    {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                    <a data-tooltip-id="message" data-tooltip-content={props.message.TimeStamp}
                       data-tooltip-place='left' data-tooltip-delay-show={700} style={{fontStyle:"italic"}}>
                        <Linkify componentDecorator={(decoratedHref, decoratedText, key) => (
                            <a target="blank" href={decoratedHref} key={key} style={{color: "#FFFF80"}}>
                                {decoratedText}
                            </a>
                        )}>
                            Message deleted.
                        </Linkify></a>
                    <Tooltip id="message"/>
                </div>
            </div>
        )
    }
    if (props.message.SenderID === userid) {
        if (props.message.Type === 'text') {
            return (
                <div style={{
                    float: "right",
                    display: "flex",
                    clear: "both",
                    maxWidth: "55%",
                    margin: "5px 10px",
                    alignItems: "center"
                }}
                     onMouseEnter={showOptions}
                     onMouseLeave={hideOptions}>
                    <button ref={messageRef} onClick={Delete} className="DeleteButton"/>
                    <div style={{background: "#007aff", color: "white"}} className="Message">
                        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                        <a data-tooltip-id="message" data-tooltip-content={props.message.TimeStamp}
                           data-tooltip-place='left' data-tooltip-delay-show={700}>
                            <Linkify componentDecorator={(decoratedHref, decoratedText, key) => (
                                <a target="blank" href={decoratedHref} key={key} style={{color: "#FFFF80"}}>
                                    {decoratedText}
                                </a>
                            )}>
                                {props.message.Text}
                            </Linkify></a>
                        <Tooltip id="message"/>
                    </div>
                </div>
            )
        } else if (props.message.Type === 'image') {
            return (
                <div style={{float: "right", display: "flex", maxWidth: "35%", clear: "both", margin: "5px 10px", alignItems:"center"}}
                     onMouseEnter={showOptions}
                     onMouseLeave={hideOptions}>
                    <button ref={messageRef} onClick={Delete} className="DeleteButton"/>
                    {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                    <a data-tooltip-id="message" data-tooltip-content={props.message.TimeStamp}
                       data-tooltip-place='left' data-tooltip-delay-show={700}>
                        <img alt={props.message.ID} src={props.message.Text} style={{width: "100%"}}/>
                    </a>
                    <Tooltip id="message"/>
                </div>
            )
        }
        else if (props.message.Type === 'video') {
            let src = "https://www.youtube.com/embed/" + props.message.Text
            return (
                <div style={{float: "right", display: "flex", clear: "both", margin: "5px 10px", alignItems: "center"}}
                     onMouseEnter={showOptions}
                     onMouseLeave={hideOptions}>
                    <button ref={messageRef} onClick={Delete} className="DeleteButton"/>
                    {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                    <a data-tooltip-id="message" data-tooltip-content={props.message.TimeStamp}
                       data-tooltip-place='left' data-tooltip-delay-show={700}>
                        <iframe src={src} width="560px" height="315px"
                                title="YouTube video player"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
                    </a>
                </div>
            )
        }
    } else {
        if (props.message.Type === 'text') {
                return (
                    <div style={{
                        float: "left",
                        display: "flex",
                        clear: "both",
                        maxWidth: "55%",
                        margin: "5px 10px",
                        alignItems: "center"
                    }}>
                        <div style={{background: "#f2f2f7", color: "black", float: "left"}} className="Message">
                            <div style={{color: "#8f8f92", fontSize: "14px"}}>{props.message.SenderName}</div>
                            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                            <a data-tooltip-id="message" data-tooltip-content={props.message.TimeStamp}
                               data-tooltip-place='right' data-tooltip-delay-show={700}>
                                <Linkify componentDecorator={(decoratedHref, decoratedText, key) => (
                                    <a target="blank" href={decoratedHref} key={key}>
                                        {decoratedText}
                                    </a>
                                )}>
                                    {props.message.Text}
                                </Linkify></a>
                            <Tooltip id="message"/>
                        </div>
                    </div>
                )
            } else if (props.message.Type === 'image') {
                return (
                    <div style={{
                        float: "left",
                        display: "flex",
                        maxWidth: "35%",
                        clear: "both",
                        margin: "5px 10px",
                        alignItems: "center"
                    }}>
                        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                        <div>
                            <div style={{color: "#8f8f92", fontSize: "14px"}}>{props.message.SenderName}</div>
                            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                            <a data-tooltip-id="message" data-tooltip-content={props.message.TimeStamp}
                               data-tooltip-place='left' data-tooltip-delay-show={700}>
                                <img alt={props.message.ID} src={props.message.Text} style={{width: "100%"}}/>
                            </a>
                            <Tooltip id="message"/>
                        </div>
                    </div>
                )
            } else if (props.message.Type === 'video') {
                let src = "https://www.youtube.com/embed/" + props.message.Text
            return (
                <div style={{float: "left", display: "flex", clear: "both", margin: "5px 10px", alignItems: "center"}}>
                    <div>
                        <div style={{color: "#8f8f92", fontSize: "14px"}}>{props.message.SenderName}</div>
                        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                        <a data-tooltip-id="message" data-tooltip-content={props.message.TimeStamp}
                           data-tooltip-place='left' data-tooltip-delay-show={700}>
                            <iframe src={src} width="560px" height="315px"
                                    title="YouTube video player"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
                        </a>
                    </div>
                </div>
            )
        }
    }
}