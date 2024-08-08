import "./profile.scss"
import Popup from "reactjs-popup";
import {ErrorNotification, Reconnect, SuccessNotification} from "../notifications/notifications";
import React, {useEffect, useRef, useState} from "react";
import {Navigate, useNavigate} from "react-router-dom";
import {parse} from "lossless-json";
import {LogOut, socket, User} from "../api/auth";
import {Decompress, SaveMessage} from "../api/message";
import {channels, channelsMap, RequestChannelList} from "../api/channel";
import {ChangePassword, RequestUserInfo} from "../api/user";
import {SetChannel} from "../conversation/conversation";
export function Profile() {
    const ref = useRef()
    const [, forceRender] = useState(false)
    const history = useNavigate()
    const navigate = useNavigate()
    function connectionLost() {
        LogOut()
        history("/login", {replace: true})
    }
    useEffect(() => {
        SetChannel(0)
        socket.onerror = () => {
            Reconnect(ref).then((result) => {if (result) forceRender(render => !render)})
        }
        socket.onmessage = data => {
            let message = parse(Decompress(data.data))
            if (channelsMap[message.Channel.valueOf()] === undefined) {
                RequestChannelList(false).then(
                    () => {
                        SaveMessage(message)
                    }
                )
            } else {
                SaveMessage(message)
            }
        }
    })
    if (User.token === "0") {
        return <Navigate replace to="/login"/>
    }
    return (
        <div>
            <Popup ref={ref} modal onClose={connectionLost} className="error-popup">
                Connection to server lost. Please log in again.
                <button style={{flex:"1", minWidth:"40%", margin:"5px"}} onClick={()=>ref.current.close()}>OK</button>
            </Popup>
            <button onClick={() => {navigate("/dashboard", {replace: true})}} className="BackButton"/>
            <UserInfo/>
            <ChangePasswordPrompt/>
        </div>
    )
}
function ChangePasswordPrompt() {
    const ConfirmPopup = useRef(null)
    const [mismatch, pMismatch] = useState(false)
    const [wrongOldPassword, pWrong] = useState(false)
    const [duplicatePassword, duplicate] = useState(false)
    const oldPassword = useRef(null)
    const newPassword1 = useRef(null)
    const newPassword2 = useRef(null)
    function OldPasswordHandler(e) {
        pWrong(false)
        duplicate(false)
        if (e.key === 'Enter' && oldPassword.current.value !=='') {
            newPassword1.current.focus()
        }
    }

    function NewPassword1Handler(e) {
        pMismatch(false)
        duplicate(false)
        if (e.key === 'Enter' && newPassword1.current.value !=='') {
            newPassword2.current.focus()
        }
    }

    function NewPassword2Handler() {
        pMismatch(false)
        duplicate(false)
    }

    async function SubmitChangePassword() {
        ConfirmPopup.current.close()
        if (newPassword1.current.value !== newPassword2.current.value) {
            pMismatch(true)
            return
        }
        if (oldPassword.current.value === "" || newPassword1.current.value === "" || newPassword2.current.value === "") {
            ErrorNotification("blank-field", "No password fields are allowed to be blank.")
            return
        }
        let response = await ChangePassword(oldPassword.current.value, newPassword1.current.value)
        if (response !== 200) {
            if (response === 403) {
                pWrong(true)
            }
            else if (response === 409) {
                duplicate(true)
            } else {
                ErrorNotification("password-change-error", "Some errors occurred. Please try again.")
            }
        } else {
            SuccessNotification("password-change-success", "Password changed successfully.")
        }
    }

    function ClosePopup() {
        ConfirmPopup.current.close()
    }

    function Confirming() {
        pWrong(false)
        pMismatch(false)
        duplicate(false)
    }

    return (
        <div style={{
            border: "1px solid black",
            width: "20%",
            minHeight: "40%",
            display: "flex",
            flexDirection: "column",
            padding:"5px",
            textAlign: "center",
        }}>
            Change Password
            <div style={{display:"flex", flexDirection:"column", margin:"5px 2px", textAlign:"left"}}>
                Old password
                <input ref={oldPassword} onKeyDown={OldPasswordHandler} type="password" className="PasswordPrompt"/>
            </div>
            <div style={{display: "flex", flexDirection: "column", margin: "5px 2px", textAlign:"left"}}>
                New password
                <input ref={newPassword1} onKeyDown={NewPassword1Handler} type="password" className="PasswordPrompt"/>
            </div>
            <div style={{display: "flex", flexDirection: "column", margin: "5px 2px", textAlign:"left"}}>
                Confirm new password
                <input ref={newPassword2} onKeyDown={NewPassword2Handler} type="password" className="PasswordPrompt"/>
            </div>
            {mismatch && <div style={{color:"red", margin:"3px 0"}}>Passwords do not match.</div>}
            {wrongOldPassword && <div style={{color: "red", margin: "3px 0"}}>Wrong old password.</div>}
            {duplicatePassword && <div style={{color: "red", margin: "3px 0"}}>Old and new passwords can not be the same.</div>}
            <Popup className="confirm-popup" ref={ConfirmPopup} trigger={<button className="ConfirmButton">Change Password</button>}
                   onOpen={Confirming}
                   modal nested>
                <div style={{
                    display:"flex",
                    flexDirection:"column",
                    textAlign:"center",
                    padding:"10px",
                    width: "fit-content",
                    fontSize: "20px",}}>
                    Are you sure?
                    <div style={{display:"flex", justifyContent:"center", minWidth:"200px", flex:"1"}}>
                        <button onClick={SubmitChangePassword} style={{margin:"5px", minWidth:"20%"}} className="ConfirmButton">Yes</button>
                        <button onClick={ClosePopup} style={{margin:"5px", minWidth:"20%"}} className="ConfirmButton">No</button>
                    </div>
                </div>
            </Popup>
        </div>
    )
}
function UserInfo() {
    const [joinDate, setJoinDate] = useState(User.joinDate)
    useEffect(() => {
        if (User.joinDate === null) {
            GetJoinDate().then((result) => {
                if (result) setJoinDate(User.joinDate)
            })
        }
    }, []);
    async function GetJoinDate() {
        let response = await RequestUserInfo(User.userid)
        if (response === false) {
            ErrorNotification("user-info-error", "Some error occurred. Please try again.")
            return false
        }
        return true
    }
    return (
        <div style={{
            display:"flex",
            width:"20%",
            border:"1px solid black",
            flexDirection:"column",
            marginBottom : "12px",
            padding: "5px"
        }}>
            {User.username}
            <div>#{User.userid}</div>
            {joinDate !== null ? <div>Member since: {joinDate}</div> : <div>Member since: N/A<button onClick={() => {
                GetJoinDate().then((result) => {
                        if (result) setJoinDate(User.joinDate)
                    }
                )}
            }>Reload</button></div>}
            <div>Member of {channels.length} {(channels.length <= 1) ? 'channel.' : 'channels.'}</div>
        </div>
    )
}