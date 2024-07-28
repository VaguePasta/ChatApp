import React, {useContext, useEffect, useRef, useState} from "react";
import "./chatinfo.scss"
import {CurrentChannel, SetChannel} from "../conversation/conversation";
import {CurrentChatContext} from "../dashboard/dashboard";
import Popup from "reactjs-popup";
import {ErrorNotification} from "../notifications/notifications";
import {ChangeChannelName, channels, channelsMap, DeleteChannel, RequestChannelList, RequestChat} from "../api/channel";
export function ChatInfo(props) {
    const [privilege, p] = useState(null)
    const currentChat = useContext(CurrentChatContext)
    const [channelName, changeName] = useState("")
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
        if (CurrentChannel === 0) {
            changeName("")
            return
        }
        changeName(channels.find(obj => {
            return obj.ChannelID.valueOf() === CurrentChannel
        }).Title)
    }, [currentChat.Current]);
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
                changeName(e.target.value)
                await RequestChannelList()
                props.handler(false, true, false, false)
            }
            else {
                ErrorNotification("no-privilege", "Admin privilege required.")
            }
        }
    }
    async function reload() {
        channelsMap[CurrentChannel] = []
        if (reloading === false) {
            reloadChat(true)
            setTimeout(() => reloadChat(false), 1000)
        }
        RequestChat(CurrentChannel).then(
            () => {
                props.handler(false, false, false, false)
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
                    RequestChannelList().then(
                        () => {
                            SetChannel(0)
                            props.handler()
                        }
                    )
                }
                else {
                    ErrorNotification("no-privilege", "Admin privilege required.")
                }
            }
        )
    }

    function LeaveChannelClick() {
        ConfirmPopupLeave.current.open()
    }
    function ConfirmLeave() {
        ConfirmPopupLeave.current.close()
    }
    function RefuseLeave() {
        ConfirmPopupLeave.current.close()
    }
    function RefuseDelete() {
        ConfirmPopupDelete.current.close()
    }
    return (
        <div className="ChatInfo">
            <div style={{marginLeft: "0", flex: "1", textOverflow:"ellipsis", overflow: "hidden"}}>{channelName}</div>
            {reloading ? <button onClick={reload} className="ChatInfoButton Reload Reloading"/> : <button onClick={reload} className="ChatInfoButton Reload"/>}
            <Popup position="bottom right" className="tooltip-popup" ref={ref}
               trigger={<button className="ChatInfoButton MenuBar"/>}>
                {privilege === 'admin' && <Popup trigger={<button className="popup-button">Change Channel Name</button>}>
                    <input onKeyDown={ChangeName}/>
                </Popup>}
                <button onClick={() => {
                    if (!props.showingMem) props.showMem(true)
                    ref.current.close()
                }} style={{borderWidth: "1px 0"}} className="popup-button">Chat member(s)...</button>
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