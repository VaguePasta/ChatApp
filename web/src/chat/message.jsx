import "./message.scss"
import Linkify from "react-linkify";
import {useRef, useState} from "react";
import {Reply} from "./reply";
import {DeleteMessage, removeMessage} from "../api/message";
import {User} from "../api/auth";
import {TimeStamp} from "./timestamp";
import Popup from "reactjs-popup";
import {ErrorNotification} from "../notifications/notifications";

export function Message(props) {
    const ButtonGroup = useRef(null)
    const [isDeleted, deleteMessage] = useState(false)
    const message = useRef()
    const deletePopup = useRef()

    function showOptions() {
        ButtonGroup.current.style.visibility = 'visible'
    }

    function hideOptions() {
        ButtonGroup.current.style.visibility = 'hidden'
    }

    async function Delete() {
        if (await DeleteMessage(props.message.ID.valueOf())) {
            if (props.replyTo === props.message.ID.valueOf()) {
                props.reply(0)
            }
            removeMessage(props.message.Channel.valueOf(), props.message.ID.valueOf())
            deleteMessage(true)
        } else {
            ErrorNotification("not-deleted", "Cannot delete message.")

        }
        deletePopup.current.close()
    }

    async function ReplyMessage() {
        props.reply(props.message.ID.valueOf())
    }

    const [seeingTimeStamp, seeTimeStamp] = useState(false)
    let timeStampTimeout = null
    if (isDeleted && props.message.SenderID.valueOf() === User.userid) {
        return (
            <div style={{
                float: "right",
                display: "flex",
                clear: "both",
                maxWidth: "55%",
                margin: "5px 10px",
                alignItems: "center",
            }}>
                <div style={{background: "transparent", color: "black", border: "solid 1px"}} className="Message">
                    <Linkify componentDecorator={(decoratedHref, decoratedText, key) => (
                        <a target="blank" href={decoratedHref} key={key} style={{color: "#FFFF80"}}>
                            {decoratedText}
                        </a>
                    )}>
                        Message deleted.
                    </Linkify>
                </div>
            </div>
        )
    }
    if (props.message.SenderID.valueOf() === User.userid) {
        if (props.message.Type === 'text') {
            return (
                <div style={{
                    float: "right",
                    display: "flex",
                    clear: "both",
                    maxWidth: "60%",
                    margin: "5px 10px",
                    alignItems: "end",
                    flexDirection: "column",
                    overflowWrap: "break-word"
                }}
                     onMouseEnter={() => showOptions(true)}
                     onMouseLeave={() => hideOptions(true)}>
                    {props.message.ReplyTo !== null &&
                        <Reply margin={"0 0 -5px auto"} ID={props.message.ReplyTo.valueOf()}/>}
                    <div style={{display: "flex", alignItems: "center", zIndex: "2"}}>
                        <div style={{display: "flex", visibility: "hidden"}} ref={ButtonGroup}>
                            <Popup className="confirm-popup" ref={deletePopup}
                                   trigger={<button className="Button DeleteButton"/>}
                                   modal nested>
                                <div style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    padding: "15px 5px"
                                }}>
                                    <div style={{
                                        fontFamily: "\"Open Sans\", sans-serif",
                                        fontOpticalSizing: "auto",
                                        fontWeight: "500",
                                        fontStyle: "normal",
                                        fontSize: "15px",
                                        fontVariationSettings: "\"wdth\" 100",
                                        paddingBottom: "10px"
                                    }}>Are you sure you want to delete this message? This action cannot be undone.
                                    </div>
                                    <div style={{width: "100%", display: "flex"}}>
                                        <button className="Confirm-Delete" onClick={Delete}>Yes</button>
                                        <button onClick={() => deletePopup.current.close()}
                                                className="Reject-Delete">No
                                        </button>
                                    </div>
                                </div>
                            </Popup>
                            <button onClick={ReplyMessage} className="Button ReplyButton"/>
                        </div>
                        <div onMouseLeave={() => {
                            clearTimeout(timeStampTimeout)
                            timeStampTimeout = null
                            seeTimeStamp(false)
                        }}
                             onMouseEnter={() => {
                                 timeStampTimeout = setTimeout(() => seeTimeStamp(true), 500)
                             }}
                             ref={message}
                             style={{background: "#007aff", color: "white", marginLeft: "auto"}}
                             className="Message">
                            {message.current && seeingTimeStamp && <TimeStamp timeStamp={props.message.TimeStamp}
                                                                              offSet={message.current.getBoundingClientRect()}
                                                                              plusHeight={message.current.clientHeight}
                                                                              isRight={true}/>}
                            <Linkify componentDecorator={(decoratedHref, decoratedText, key) => (
                                <a target="blank" href={decoratedHref} key={key} style={{color: "#FFFF80"}}>
                                    {decoratedText}
                                </a>
                            )}>
                                {props.message.Text}
                            </Linkify>
                        </div>
                    </div>
                </div>
            )
        } else if (props.message.Type === 'image') {
            return (
                <div style={{
                    float: "right",
                    display: "flex",
                    maxWidth: "55%",
                    clear: "both",
                    margin: "5px 10px",
                    alignItems: "end",
                    flexDirection: "column"
                }}
                     onMouseEnter={() => showOptions(true)}
                     onMouseLeave={() => hideOptions(true)}>
                    {props.message.ReplyTo !== null &&
                        <Reply margin={"0 0 -5px auto"} ID={props.message.ReplyTo.valueOf()}/>}
                    <div style={{display: "flex", alignItems: "center", zIndex: "2", marginLeft: "auto"}}>
                        <div style={{display: "flex", visibility: "hidden"}} ref={ButtonGroup}>
                            <Popup className="confirm-popup" ref={deletePopup}
                                   trigger={<button className="Button DeleteButton"/>}
                                   modal nested>
                                <div style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    padding: "15px 5px"
                                }}>
                                    <div style={{
                                        fontFamily: "\"Open Sans\", sans-serif",
                                        fontOpticalSizing: "auto",
                                        fontWeight: "500",
                                        fontStyle: "normal",
                                        fontSize: "15px",
                                        fontVariationSettings: "\"wdth\" 100",
                                        paddingBottom: "10px"
                                    }}>Are you sure you want to delete this message? This action cannot be undone.
                                    </div>
                                    <div style={{width: "100%", display: "flex"}}>
                                        <button className="Confirm-Delete" onClick={Delete}>Yes</button>
                                        <button onClick={() => deletePopup.current.close()}
                                                className="Reject-Delete">No
                                        </button>
                                    </div>
                                </div>
                            </Popup>
                            <button onClick={ReplyMessage} className="Button ReplyButton"/>
                        </div>
                        <div onMouseLeave={() => {
                            clearTimeout(timeStampTimeout)
                            timeStampTimeout = null
                            seeTimeStamp(false)
                        }}
                             onMouseEnter={() => {
                                 timeStampTimeout = setTimeout(() => seeTimeStamp(true), 500)
                             }}
                             ref={message}>
                            {message.current && seeingTimeStamp && <TimeStamp timeStamp={props.message.TimeStamp}
                                                                              offSet={message.current.getBoundingClientRect()}
                                                                              plusHeight={message.current.clientHeight}
                                                                              isRight={true}/>}
                            <img alt={props.message.Text} src={props.message.Text}
                                 style={{
                                     wordWrap: "anywhere",
                                     background: "white",
                                     width: "100%",
                                     border: "1px solid black",
                                     borderRadius: "5px 7px"
                                 }}/>
                        </div>
                    </div>
                </div>
            )
        } else if (props.message.Type === 'video') {
            let src = "https://www.youtube.com/embed/" + props.message.Text
            return (
                <div style={{
                    float: "right",
                    display: "flex",
                    clear: "both",
                    margin: "5px 10px",
                    alignItems: "end",
                    maxHeight: "fit-content",
                    width: "55%",
                    flexDirection: "column"
                }}
                     onMouseEnter={() => showOptions(true)}
                     onMouseLeave={() => hideOptions(true)}>
                    {props.message.ReplyTo !== null &&
                        <Reply margin={"0 0 -5px auto"} ID={props.message.ReplyTo.valueOf()}/>}
                    <div style={{display: "flex", alignItems: "center", zIndex: "2", minWidth: "100%"}}
                         onMouseLeave={() => {
                             clearTimeout(timeStampTimeout)
                             timeStampTimeout = null
                             seeTimeStamp(false)
                         }}
                         onMouseEnter={() => {
                             timeStampTimeout = setTimeout(() => seeTimeStamp(true), 500)
                         }}
                         ref={message}>
                        {message.current && seeingTimeStamp && <TimeStamp timeStamp={props.message.TimeStamp}
                                                                          offSet={message.current.getBoundingClientRect()}
                                                                          plusHeight={message.current.clientHeight}
                                                                          isRight={true}/>}
                        <div style={{display: "flex", visibility: "hidden"}} ref={ButtonGroup}>
                            <Popup className="confirm-popup" ref={deletePopup}
                                   trigger={<button className="Button DeleteButton"/>}
                                   modal nested>
                                <div style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    padding: "15px 5px"
                                }}>
                                    <div style={{
                                        fontFamily: "\"Open Sans\", sans-serif",
                                        fontOpticalSizing: "auto",
                                        fontWeight: "500",
                                        fontStyle: "normal",
                                        fontSize: "15px",
                                        fontVariationSettings: "\"wdth\" 100",
                                        paddingBottom: "10px"
                                    }}>Are you sure you want to delete this message? This action cannot be undone.
                                    </div>
                                    <div style={{width: "100%", display: "flex"}}>
                                        <button className="Confirm-Delete" onClick={Delete}>Yes</button>
                                        <button onClick={() => deletePopup.current.close()}
                                                className="Reject-Delete">No
                                        </button>
                                    </div>
                                </div>
                            </Popup>
                            <button onClick={ReplyMessage} className="Button ReplyButton"/>
                        </div>
                        <iframe
                            src={src} style={{
                            aspectRatio: "16/9",
                            flexShrink: "0",
                            width: "85%",
                            maxWidth: "85%",
                            border: "1px solid black",
                            borderRadius: "5px 7px"
                        }}
                            title="YouTube video player"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin" allowFullScreen/>
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
                    alignItems: "start",
                    flexDirection: "column"
                }}
                     onMouseEnter={() => showOptions(false)}
                     onMouseLeave={() => hideOptions(false)}>
                    <div style={{
                        color: "#8f8f92",
                        fontSize: "14px",
                        marginRight: "auto"
                    }}>{props.message.SenderName}</div>
                    {props.message.ReplyTo !== null &&
                        <Reply margin={"0 auto -5px 0"} ID={props.message.ReplyTo.valueOf()}/>}
                    <div style={{display: "flex", alignItems: "center", zIndex: "2"}}>
                        <div style={{background: "#f2f2f7", color: "black", float: "left"}} className="Message"
                             onMouseLeave={() => {
                                 clearTimeout(timeStampTimeout)
                                 timeStampTimeout = null
                                 seeTimeStamp(false)
                             }}
                             onMouseEnter={() => {
                                 timeStampTimeout = setTimeout(() => seeTimeStamp(true), 500)
                             }}
                             ref={message}>
                            <Linkify componentDecorator={(decoratedHref, decoratedText, key) => (
                                <a target="blank" href={decoratedHref} key={key}>
                                    {decoratedText}
                                </a>
                            )}>
                                {props.message.Text}
                            </Linkify>
                            {message.current && seeingTimeStamp && <TimeStamp timeStamp={props.message.TimeStamp}
                                                                              offSet={message.current.getBoundingClientRect()}
                                                                              plusHeight={message.current.clientHeight}
                                                                              isRight={false}/>}
                        </div>
                        <div style={{display: "flex", visibility: "hidden"}} ref={ButtonGroup}>
                            <button onClick={ReplyMessage} className="Button ReplyButton"/>
                        </div>
                    </div>
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
                    alignItems: "start",
                    flexDirection: "column"
                }}
                     onMouseEnter={() => showOptions(false)}
                     onMouseLeave={() => hideOptions(false)}>
                    <div style={{
                        color: "#8f8f92",
                        fontSize: "14px",
                        marginRight: "auto"
                    }}>{props.message.SenderName}</div>
                    {props.message.ReplyTo !== null &&
                        <Reply margin={"0 auto -5px 0"} ID={props.message.ReplyTo.valueOf()}/>}
                    <div style={{display: "flex", alignItems: "center", zIndex: "2", marginRight: "auto"}}>
                        <div onMouseLeave={() => {
                            clearTimeout(timeStampTimeout)
                            timeStampTimeout = null
                            seeTimeStamp(false)
                        }}
                             onMouseEnter={() => {
                                 timeStampTimeout = setTimeout(() => seeTimeStamp(true), 500)
                             }} ref={message}>
                            <img alt={props.message.Text} src={props.message.Text}
                                 style={{
                                     wordWrap: "anywhere",
                                     background: "white",
                                     width: "100%",
                                     border: "1px solid black",
                                     borderRadius: "5px 7px"
                                 }}/>
                            {message.current && seeingTimeStamp && <TimeStamp timeStamp={props.message.TimeStamp}
                                                                              offSet={message.current.getBoundingClientRect()}
                                                                              plusHeight={message.current.clientHeight}
                                                                              isRight={false}/>}
                        </div>
                        <div style={{display: "flex", visibility: "hidden"}} ref={ButtonGroup}>
                            <button onClick={ReplyMessage} className="Button ReplyButton"/>
                        </div>
                    </div>
                </div>
            )
        } else if (props.message.Type === 'video') {
            let src = "https://www.youtube.com/embed/" + props.message.Text
            return (
                <div style={{
                    float: "left",
                    display: "flex",
                    clear: "both",
                    margin: "5px 10px",
                    alignItems: "start",
                    maxHeight: "fit-content",
                    width: "55%",
                    flexDirection: "column"
                }}
                     onMouseEnter={() => showOptions(false)}
                     onMouseLeave={() => hideOptions(false)}>
                    <div style={{
                        color: "#8f8f92",
                        fontSize: "14px",
                        marginRight: "auto"
                    }}>{props.message.SenderName}</div>
                    {props.message.ReplyTo !== null &&
                        <Reply margin={"0 auto -5px 0"} ID={props.message.ReplyTo.valueOf()}/>}
                    <div
                        style={{display: "flex", alignItems: "center", zIndex: "2", minWidth: "100%"}}
                        onMouseLeave={() => {
                            clearTimeout(timeStampTimeout)
                            timeStampTimeout = null
                            seeTimeStamp(false)
                        }}
                        onMouseEnter={() => {
                            timeStampTimeout = setTimeout(() => seeTimeStamp(true), 500)
                        }} ref={message}>
                        <iframe src={src}
                                style={{
                                    aspectRatio: "16/9",
                                    flexShrink: "0",
                                    width: "85%",
                                    maxWidth: "85%",
                                    border: "1px solid black",
                                    borderRadius: "5px 7px"
                                }}
                                title="YouTube video player"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                referrerPolicy="strict-origin-when-cross-origin" allowFullScreen/>
                        <div style={{display: "flex", visibility: "hidden"}} ref={ButtonGroup}>
                            <button onClick={ReplyMessage} className="Button ReplyButton"/>
                        </div>
                        {message.current && seeingTimeStamp && <TimeStamp timeStamp={props.message.TimeStamp}
                                                                          offSet={message.current.getBoundingClientRect()}
                                                                          plusHeight={message.current.clientHeight}
                                                                          isRight={false}/>}
                    </div>
                </div>
            )
        }
    }
}