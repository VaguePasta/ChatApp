import {createRef, useState} from "react";
import "./infoprompt.scss"
import {LogIn, token} from "../api/api";
import {Navigate, useNavigate} from "react-router-dom";
export function LogInPrompt() {
    let history = useNavigate()
    let Username = createRef()
    let Password = createRef()
    const [wrongCredential,credential] = useState(false)
    function UsernameHandler(e) {
        if (e.key === 'Enter') {
            Password.current.focus()
        }
    }
    function PasswordHandler(e) {
        if (e.key === 'Enter' && Password.current.value !== '' && Username.current.value !== '') {
            LogIn(Username.current.value,Password.current.value)
            if (token !== "0") {
                history("/dashboard")
            }
            else credential(true)
        }
    }
    function LoginClick() {
        if (Username.current.value !== '' && Password.current.value !== '') {
            LogIn(Username.current.value,Password.current.value)
            if (token !== "0") {
                history("/dashboard")
            }
            else credential(true)
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
            <label className="InfoLabel" style={{fontSize:14, marginLeft:5, marginTop:20,marginBottom:10}}>
                Username:
                <input className="InfoText" ref={Username} onChange={InputChangeHandler} onKeyDown={UsernameHandler}/>
            </label>
            <label className="InfoLabel" style={{fontSize:14, marginLeft:5, marginTop:20,marginBottom:10}}>
                Password:
                <input type="password" className="InfoText" ref={Password} onChange={InputChangeHandler} onKeyDown={PasswordHandler}/>
            </label>
            {wrongCredential ? <label className="InfoLabel" style={{fontSize:14, marginLeft:5, color:"red"}}>Wrong username or password</label> : false}
            <button className="SubmitButton" onClick={LoginClick}>Continue</button>
        </div>
    )
}