import {createRef, useState} from "react";
import "./infoprompt.scss"
import {LogIn, token} from "../api/api";
import {Navigate, useNavigate} from "react-router-dom";
export let username = ''
export function LogInPrompt() {
    let history = useNavigate()
    let Username = createRef()
    let Password = createRef()
    const [wrongCredential,credential] = useState(false)
    const [capslock, toggleCaps] = useState(false)
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
            LogIn(Username.current.value,Password.current.value).then(() => {
                if (token !== "0") {
                    username = Username.current.value
                    history("/dashboard", {replace: true})
                }
                else credential(true)
            })
        }
        else if (e.key === "CapsLock") CheckCaps(e)
    }
    function LoginClick() {
        if (Username.current.value !== '' && Password.current.value !== '') {
            LogIn(Username.current.value,Password.current.value).then(() => {
                if (token !== "0") {
                    username = Username.current.value
                    history("/dashboard", {replace: true})
                }
                else credential(true)
            })
        }
    }
    function InputChangeHandler() {
        if (wrongCredential) credential(false)
    }
    if (token !== "0") {
        return (
             <Navigate replace to="/dashboard"/>
        )
    }
    return (
        <div className="InfoPrompt">
            <label className="InfoLabel" style={{fontSize:20, textAlign:"center",}}>Authentication Required</label>
            <input placeholder="Username" className="InfoText" ref={Username} onChange={InputChangeHandler} onKeyDown={UsernameHandler}/>
            <input placeholder="Password" type="password" className="InfoText" ref={Password} onChange={InputChangeHandler} onKeyDown={PasswordHandler}/>
            {capslock ?
                <label className="InfoLabel" style={{fontSize: 14, marginLeft: 5, color: "green"}}>Caps Lock is on.</label> : false}
            {wrongCredential ?
                <label className="InfoLabel" style={{fontSize: 14, color: "red"}}>Wrong username or password.</label> : false}
            <label className="InfoLabel" style={{fontSize: 15}}>Don't have an account? <a href="/register" className="InfoLabel" style={{fontSize: 15, display: "inline"}}>Sign up</a></label>
            <button className="SubmitButton" onClick={LoginClick}>Continue</button>
        </div>
    )
}