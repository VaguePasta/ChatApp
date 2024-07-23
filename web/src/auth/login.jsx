import {createRef, useState} from "react";
import "./infoprompt.scss"
import {LogIn, OpenSocket, socket, UpdateUsername, user} from "../api/api";
import {Navigate, useNavigate} from "react-router-dom";
import {ErrorNotification} from "../dashboard/notifications";
export function LogInPrompt() {
    let history = useNavigate()
    let Username = createRef()
    let Password = createRef()
    const [wrongCredential,credential] = useState(false)
    const [capslock, toggleCaps] = useState(false)
    const [signing, signingIn] = useState(false)
    function CheckCaps(e) {
        if (e.getModifierState("CapsLock")) {
            toggleCaps(true)
        } else {
            toggleCaps(false)
        }
    }
    function UsernameHandler(e) {
        if (e.key === 'Enter') {
            Password.current.focus()
            CheckCaps(e)
        }
    }
    function PasswordHandler(e) {
        if (e.key === 'Enter' && Password.current.value !== '' && Username.current.value !== '') {
            let _username = Username.current.value
            let _password = Password.current.value
            signingIn(true)
            LogIn(_username,_password).then(() => Proceed(_username))
        }
        else if (e.key === "CapsLock") CheckCaps(e)
    }
    function Proceed(username) {
        if (user.token !== "0") {
            OpenSocket()
            socket.onopen = () => {
                signingIn(false)
                UpdateUsername(username)
                socket.onclose = () => {}
                history("/dashboard", {replace: true})
            }
            socket.onclose = () => {
                signingIn(false)
                ErrorNotification("socket-error", "Cannot connect to server. Please try again.")
            }
        }
        else {
            signingIn(false)
            credential(true)
        }
    }
    function LoginClick() {
        if (Username.current.value !== '' && Password.current.value !== '') {
            let _username = Username.current.value
            let _password = Password.current.value
            signingIn(true)
            LogIn(_username,_password).then(() => Proceed(_username))
        }
    }
    function InputChangeHandler() {
        if (wrongCredential) credential(false)
    }
    if (user.token !== "0" && socket.readyState === WebSocket.OPEN) {
        return (
             <Navigate replace to="/dashboard"/>
        )
    }
    return (
        <div className="InfoPrompt">
            <label className="InfoLabel" style={{fontSize:20, textAlign:"center",}}>Authentication Required</label>
            <input placeholder="Username" className="InfoText" ref={Username} onChange={InputChangeHandler} onKeyDown={UsernameHandler}/>
            <input placeholder="Password" type="password" className="InfoText" ref={Password} onChange={InputChangeHandler} onKeyDown={PasswordHandler}/>
            {capslock &&
                <label className="InfoLabel" style={{fontSize: 14, color: "green"}}>Caps Lock is on.</label>}
            {wrongCredential &&
                <label className="InfoLabel" style={{fontSize: 14, color: "red"}}>Wrong username or password.</label>}
            {signing &&
                <label className="InfoLabel" style={{fontSize: 14, color: "red"}}>Logging in...</label>}
            <label className="InfoLabel" style={{fontSize: 15}}>Don't have an account? <a href="/register" className="InfoLabel" style={{fontSize: 15, display: "inline"}}>Sign up</a></label>
            <button className="SubmitButton" onClick={LoginClick}>Continue</button>
        </div>
    )
}