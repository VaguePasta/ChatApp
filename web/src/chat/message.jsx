import "./message.scss"
import {Tooltip} from "react-tooltip";
import {DeleteMessage, removeMessage, user} from "../api/api";
import Linkify from "react-linkify";
import {useRef, useState} from "react";
import {Reply} from "./reply";
export function Message(props) {
    const deleteButton = useRef(null)
    const replyButton = useRef(null)
    const [isDeleted, deleteMessage] = useState(false)
    function showOptions(isSelf) {
        if (isSelf) deleteButton.current.style.visibility = 'visible'
        replyButton.current.style.visibility = 'visible'
    }
    function hideOptions(isSelf) {
        if (isSelf) deleteButton.current.style.visibility = 'hidden'
        replyButton.current.style.visibility = 'hidden'
    }

    async function Delete() {
        console.log(props.message.ID.valueOf())
        if (await DeleteMessage(props.message.ID.valueOf())) {
            if (props.replyTo === props.message.ID.valueOf()) {
                props.reply(0)
            }
            removeMessage(props.message.Channel.valueOf(), props.message.ID.valueOf())
            deleteMessage(true)
        }
    }
    async function ReplyMessage() {
        props.reply(props.message.ID.valueOf())
    }
    if (isDeleted && props.message.SenderID.valueOf() === user.userid) {
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
    if (props.message.SenderID.valueOf() === user.userid) {
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
                     onMouseEnter={() => showOptions(true)}
                     onMouseLeave={() => hideOptions(true)}>
                    <button ref={deleteButton} onClick={Delete} className="Button DeleteButton"/>
                    <button ref={replyButton} onClick={ReplyMessage} className="Button ReplyButton"/>
                    <div style={{display: "flex", flexDirection: "column"}}>
                        {props.message.ReplyTo.valueOf() !== 0 &&
                            <Reply margin={"0 0 -5px auto"} ID={props.message.ReplyTo.valueOf()}/>}
                        <div style={{background: "#007aff", color: "white", marginLeft: "auto"}} className="Message">
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
                </div>
            )
        } else if (props.message.Type === 'image') {
            return (
                <div style={{
                    float: "right",
                    display: "flex",
                    maxWidth: "45%",
                    clear: "both",
                    margin: "5px 10px",
                    alignItems: "center"
                }}
                     onMouseEnter={() => showOptions(true)}
                     onMouseLeave={() => hideOptions(true)}>
                    <button ref={deleteButton} onClick={Delete} className="Button DeleteButton"/>
                    <button ref={replyButton} onClick={ReplyMessage} className="Button ReplyButton"/>
                    <div style={{display: "flex", flexDirection: "column"}}>
                        {props.message.ReplyTo.valueOf() !== 0 &&
                            <Reply margin={"0 0 -5px auto"} ID={props.message.ReplyTo.valueOf()}/>}
                        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                        <a data-tooltip-id="message" data-tooltip-content={props.message.TimeStamp}
                           data-tooltip-place='left' data-tooltip-delay-show={700}
                           style={{zIndex:"2"}}>
                            <img alt={props.message.ID.valueOf()} src={props.message.Text} style={{width: "100%"}}/>
                        </a>
                        <Tooltip id="message"/>
                    </div>
                </div>
            )
        } else if (props.message.Type === 'video') {
            let src = "https://www.youtube.com/embed/" + props.message.Text
            return (
                <div style={{float: "right", display: "flex", clear: "both", margin: "5px 10px", alignItems: "center", maxHeight:"fit-content", maxWidth: "55%"}}
                     onMouseEnter={() => showOptions(true)}
                     onMouseLeave={() => hideOptions(true)}>
                    <button ref={deleteButton} onClick={Delete} className="Button DeleteButton"/>
                    <button ref={replyButton} onClick={ReplyMessage} className="Button ReplyButton"/>
                    <div style={{display: "flex", flexDirection: "column"}}>
                        {props.message.ReplyTo.valueOf() !== 0 &&
                            <Reply margin={"0 0 -5px auto"} ID={props.message.ReplyTo.valueOf()}/>}
                        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                        <a data-tooltip-id="message" data-tooltip-content={props.message.TimeStamp}
                           data-tooltip-place='left' data-tooltip-delay-show={700} style={{zIndex:"2"}}>
                            <iframe src={src} style={{aspectRatio:"16/9", flexShrink :"0", width:"550px", maxWidth:"550px", float: "right"}}
                                    title="YouTube video player"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
                        </a>
                    </div>
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
                    }}
                         onMouseEnter={() => showOptions(false)}
                         onMouseLeave={() => hideOptions(false)}>
                        <div style={{display: "flex", flexDirection: "column"}}>
                            <div style={{color: "#8f8f92", fontSize: "14px"}}>{props.message.SenderName}</div>
                            {props.message.ReplyTo.valueOf() !== 0 &&
                                <Reply margin={"0 auto -5px 0"} ID={props.message.ReplyTo.valueOf()}/>}
                            <div style={{background: "#f2f2f7", color: "black", float: "left"}} className="Message">
                                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                                <a data-tooltip-id="message" data-tooltip-content={props.message.TimeStamp}
                                   data-tooltip-place='right' data-tooltip-delay-show={700} style={{zIndex: "2"}}>
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
                        <button ref={replyButton} onClick={ReplyMessage} className="Button ReplyButton"/>
                    </div>
                )
        } else if (props.message.Type === 'image') {
            return (
                <div style={{
                    float: "left",
                    display: "flex",
                    maxWidth: "45%",
                    clear: "both",
                    margin: "5px 10px",
                    alignItems: "center"
                }}
                     onMouseEnter={() => showOptions(false)}
                     onMouseLeave={() => hideOptions(false)}>
                    <div style={{display: "flex", flexDirection: "column"}}>
                        <div style={{color: "#8f8f92", fontSize: "14px"}}>{props.message.SenderName}</div>
                        {props.message.ReplyTo.valueOf() !== 0 &&
                            <Reply margin={"0 auto -5px 0"} ID={props.message.ReplyTo.valueOf()}/>}
                            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                            <a data-tooltip-id="message" data-tooltip-content={props.message.TimeStamp}
                               data-tooltip-place='left' data-tooltip-delay-show={700} style={{zIndex: "2"}}>
                                <img alt={props.message.ID.valueOf()} src={props.message.Text} style={{width: "100%"}}/>
                            </a>
                            <Tooltip id="message"/>
                    </div>
                    <button ref={replyButton} onClick={ReplyMessage} className="Button ReplyButton"/>
                </div>
            )
        } else if (props.message.Type === 'video') {
            let src = "https://www.youtube.com/embed/" + props.message.Text
            return (
                <div style={{float: "left", display: "flex", clear: "both", margin: "5px 10px", alignItems: "center", maxHeight:"fit-content", maxWidth: "55%"}}
                     onMouseEnter={() => showOptions(false)}
                     onMouseLeave={() => hideOptions(false)}>
                    <div style={{display: "flex", flexDirection: "column"}}>
                        <div style={{color: "#8f8f92", fontSize: "14px"}}>{props.message.SenderName}</div>
                        {props.message.ReplyTo.valueOf() !== 0 &&
                            <Reply margin={"0 auto -5px 0"} ID={props.message.ReplyTo.valueOf()}/>}
                            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                            <a data-tooltip-id="message" data-tooltip-content={props.message.TimeStamp}
                               data-tooltip-place='left' data-tooltip-delay-show={700} style={{zIndex: "2"}}>
                                <iframe src={src} style={{aspectRatio:"16/9", flexShrink :"0", width:"550px", maxWidth:"550px"}}
                                        title="YouTube video player"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
                            </a>
                    </div>
                    <button ref={replyButton} onClick={ReplyMessage} className="Button ReplyButton"/>
                </div>
            )
        }
    }
}