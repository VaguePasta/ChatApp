import React, {useContext, useEffect, useRef, useState} from "react";
import "./chatinfo.scss"
import {CurrentChannel, SetChannel} from "../conversation/conversation";
import {CurrentChatContext} from "../dashboard/dashboard";
import Popup from "reactjs-popup";
import {ErrorNotification} from "../notifications/notifications";
import {
    ChangeChannelName, ChangeCode,
    channels,
    channelsMap,
    DeleteChannel,
    LeaveChannel, RemoveFromMap,
    RequestChannelList,
    RequestChat, SetChannelList
} from "../api/channel";
export function ChatInfo(props) {
    const [privilege, p] = useState(null)
    const currentChat = useContext(CurrentChatContext)
    const [reloading, reloadChat] = useState(false)
    const ConfirmPopupDelete = useRef()
    const ConfirmPopupLeave = useRef()
    const ref = useRef()
    useEffect(() => {
        let _privilege = channels.find(obj => {
            return obj.ChannelID.valueOf() === CurrentChannel
        }) || null
        if (_privilege !== null) {
            p(_privilege.Privilege)
        }
        else p(null)
    }, [currentChat]);
    async function DeleteChannelClick() {
        ref.current.close()
        ConfirmPopupDelete.current.open()
    }
    async function ChangeName(e) {
        if (e.key === 'Enter' && e.target.value !== "") {
            ref.current.close()
            e.preventDefault()
            e.stopPropagation()
            if (await ChangeChannelName(CurrentChannel, e.target.value) === true) {
                await RequestChannelList(false)
                props.handler(true, true, false, false, false)
            }
            else {
                ErrorNotification("no-privilege", "Admin privilege required.")
            }
        }
    }
     function reload() {
        channelsMap[CurrentChannel] = []
        if (reloading === false) {
            reloadChat(true)
            setTimeout(() => reloadChat(false), 1000)
        }
        RequestChat(CurrentChannel).then(
            () => {
                props.handler(false, false, false, false, false)
            },
            () => {
                ErrorNotification("fetch-message-error", "Cannot connect to server.")
            }
        )
    }
    if (CurrentChannel === 0) {
        return (
            <div className="ChatInfo"/>
        )
    }
    function ConfirmDelete() {
        ConfirmPopupDelete.current.close()
        DeleteChannel(CurrentChannel).then(
            (result) => {
                if (result) {
                    SetChannelList(channels.filter(e => e.ChannelID.valueOf() !== CurrentChannel))
                    RemoveFromMap(CurrentChannel)
                    SetChannel(0)
                    props.handler(true, true, true, false, false)
                }
                else {
                    ErrorNotification("no-privilege", "Admin privilege required.")
                }
            }
        )
    }
    function RefuseDelete() {
        ConfirmPopupDelete.current.close()
    }
    function LeaveChannelClick() {
        ConfirmPopupLeave.current.open()
    }
    function ConfirmLeave() {
        ConfirmPopupLeave.current.close()
        LeaveChannel(CurrentChannel).then(
            () => {
                SetChannelList(channels.filter(e => e.ChannelID.valueOf() !== CurrentChannel))
                RemoveFromMap(CurrentChannel)
                SetChannel(0)
                props.handler(true, true, true, false, false)
            },
            () => {
                    ErrorNotification("leave-channel-error", "Something went wrong. Please try again.")
            }
        )
    }
    function RefuseLeave() {
        ConfirmPopupLeave.current.close()
    }
    return (
        <div className="ChatInfo">
            <div style={{marginLeft: "0", flex: "1", textOverflow:"ellipsis", overflow: "hidden"}}>{CurrentChannel !== 0 ? channels.find(e => e.ChannelID.valueOf() === CurrentChannel).Title : ""}</div>
            {reloading ? <button onClick={reload} className="ChatInfoButton Reload Reloading"/> : <button onClick={reload} className="ChatInfoButton Reload"/>}
            <Popup position="bottom right" className="tooltip-popup" ref={ref}
               trigger={<button className="ChatInfoButton MenuBar"/>} nested>
                    <Popup position="right center" onClose={() => ref.current.close()}
                        trigger={<button style={{borderBottom: "1px solid black"}} className="popup-button">Invite code...</button >}
                        className="modal-popup" modal nested>
                    <ChannelCode privilege={privilege}/>
                </Popup>
                {privilege === 'admin' && <Popup trigger={<button style={{borderWidth: "0 0 1px 0"}} className="popup-button">Change Channel Name</button>}>
                    <input onKeyDown={ChangeName}/>
                </Popup>}
                <button onClick={() => {
                    if (!props.showingMem) props.showMem(true)
                    ref.current.close()
                }} style={{borderWidth: "0 0 1px 0"}} className="popup-button">Chat member(s)...</button>
                {privilege === 'admin' && <button onClick={DeleteChannelClick} className="important-button">Delete Channel</button>}
                {privilege !== "admin" && <button onClick={LeaveChannelClick} className="important-button">Leave Channel</button>}
            </Popup>
            <Popup ref={ConfirmPopupDelete} className="confirm-popup" modal nested>
                <ConfirmPopup accept={ConfirmDelete} refuse={RefuseDelete}/>
            </Popup>
            <Popup ref={ConfirmPopupLeave} className="confirm-popup" modal nested>
                <ConfirmPopup accept={ConfirmLeave} refuse={RefuseLeave}/>
            </Popup>
        </div>
    )
}
function ConfirmPopup(props) {
    return (
        <div style={{
            display:"flex",
            flexDirection:"column",
            textAlign:"center",
            padding:"10px",
            width: "fit-content",
            fontSize: "20px",}}>
            Are you sure?
            <div style={{display:"flex", justifyContent:"center", minWidth:"200px", flex:"1"}}>
                <button onClick={props.accept} style={{margin:"5px", minWidth:"20%"}} className="ConfirmButton">Yes</button>
                <button onClick={props.refuse} style={{margin:"5px", minWidth:"20%"}} className="ConfirmButton">No</button>
            </div>
        </div>
    )
}
function ChannelCode(props) {
    const [, forceRender] = useState(false)
    const [copied, copy] = useState(false)
    return (
        <div style={{display: "flex", flexDirection: "column", width: "100%", height: "100%"}}>
            {channels.find(e => e.ChannelID.valueOf() === CurrentChannel).Code ?
                <div style={{padding: "5px", fontSize: "17px"}}>Anyone with the below code can join this channel:</div>
                :
                <div style={{padding: "5px", fontSize: "17px"}}>This channel doesn't have an invite code yet. {props.privilege === 'admin' && "Consider creating one."}</div>}
            <div style={{marginTop: "auto", width: "100%", display: "flex", flexDirection: "column"}}>
                {copied && <div style={{color: "green", marginTop: "auto", width: "100%", textAlign: "center", padding: "5px"}}>Copied to clipboard.</div>}
                {!channels.find(e => e.ChannelID.valueOf() === CurrentChannel).Code && props.privilege === 'admin' && <button className="code-options"
                    onClick={() => {
                        ChangeCode(0, CurrentChannel).then((re) => {
                            channels[channels.findIndex(e => e.ChannelID.valueOf() === CurrentChannel)].Code = String(re.Response)
                            forceRender(render => !render)
                        },
                    () => ErrorNotification("code-error", "An error occured. Please try again."))
                }}>Create code
                </button>}
                {channels.find(e => e.ChannelID.valueOf() === CurrentChannel).Code && props.privilege === 'admin' &&
                    <button className="code-options"
                    onClick={() => {
                        ChangeCode(1, CurrentChannel).then(() => {
                            channels[channels.findIndex(e => e.ChannelID.valueOf() === CurrentChannel)].Code = null
                            forceRender(render => !render)
                        },
                    () => ErrorNotification("code-error", "An error occured. Please try again."))
                }}>Delete code</button>}
            </div>
            <div style={{
                top: "50%",
                transform: "translate(0, -50%)",
                position: "absolute",
                justifyContent: "center",
                padding: "10px",
                border: "2px solid red",
                fontSize: "30px",
                alignSelf: "center",
                width: "50%",
                textAlign: "center"
            }}>
                {channels.find(e => e.ChannelID.valueOf() === CurrentChannel).Code && <button className="code-button reload-button"
                  onClick={() => {
                      ChangeCode(0, CurrentChannel).then((re) => {
                              channels[channels.findIndex(e => e.ChannelID.valueOf() === CurrentChannel)].Code = String(re.Response)
                              forceRender(render => !render)
                          },
                          () => ErrorNotification("code-error", "An error occured. Please try again."))
                  }}/>}
                <div className="invite-code" style={{margin: "auto", flex: "1"}}>
                    {channels.find(e => e.ChannelID.valueOf() === CurrentChannel).Code || "Not available"}
                </div>
                {channels.find(e => e.ChannelID.valueOf() === CurrentChannel).Code && <button
                    onClick={() => {
                        navigator.clipboard.writeText(channels.find(e => e.ChannelID.valueOf() === CurrentChannel).Code).then(() => {
                            copy(true)
                            setTimeout(() => copy(false), 1500)
                        }, () => {
                            ErrorNotification("No-permission", "Clipboard permission denied.")
                        })

                    }}
                    className="code-button copy-button"/>}
            </div>
        </div>
    )
}