import "./profile.scss"
import Popup from "reactjs-popup";
import {ErrorNotification, SuccessNotification} from "../dashboard/notifications";
import React, {useRef, useState} from "react";
import {Navigate} from "react-router-dom";
import {ChangePassword, RequestUserInfo, token} from "../api/api";
import {username} from "../auth/login";
export function Profile() {
    if (token === "0") {
        return <Navigate replace to="/login"/>
    }
    return (
        <div>
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
            <Popup ref={ConfirmPopup} trigger={<button className="ConfirmButton">Change Password</button>}
                   onOpen={Confirming}
                   modal nested>
                <div style={{
                    border:"1px solid black",
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
function UserInfo() {)
    async function GetJoinDate() {
        if (memberSince === "") {
            let response = await RequestUserInfo()
            if (response === false) {
                ErrorNotification("user-info-error", "Some error happened. Please try again.")
            }
            else return response
        }
    }
    return (
        <div style={{display:"flex", height:"50%", width:"40%", border:"1px solid black"}}>
            {username}
            {memberSince !== "" && <div>{memberSince}</div>}
        </div>
    )
}