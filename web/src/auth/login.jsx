import {createRef} from "react";
import "./loginprompt.scss"
import {LogIn, token} from "../api/api";
import {Navigate, useNavigate} from "react-router-dom";
export function LogInPrompt() {
    let history = useNavigate()
    let Username = createRef()
    let Password = createRef()
    function UsernameHandler(e) {
        if (e.key === 'Enter') {
            Password.current.focus()
        }
    }
    function PasswordHandler(e) {
        if (e.key === 'Enter' && Password.current.value !== '') {
            LogIn(Username.current.value,Password.current.value)
            if (token !== "0") {
                history("/dashboard")
            }
        }
    }
    function LoginClick() {
        if (Username.current.value !== '' && Password.current.value !== '') {
            LogIn(Username.current.value,Password.current.value)
            if (token !== "0") {
                history("/dashboard")
            }
        }
    }
    if (token !== "0") {
        return (
             <Navigate replace to="/dashboard"/>
        )
    }
    return (
        <div className="LoginPrompt">
            <label className="LoginLabel" style={{fontSize:20, textAlign:"center",}}>Authentication Required</label>
            <label className="LoginLabel" style={{fontSize:14, marginLeft:5, marginTop:20,marginBottom:10}}>
                Username:
                <input className="LoginText" ref={Username} onKeyDown={UsernameHandler}/>
            </label>
            <label className="LoginLabel" style={{fontSize:14, marginLeft:5, marginTop:20,marginBottom:10}}>
                Password:
                <input type="password" className="LoginText" ref={Password} onKeyDown={PasswordHandler}/>
            </label>
            <button className="LoginButton" onClick={LoginClick}>Continue</button>
        </div>
    )
}