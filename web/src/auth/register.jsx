import {createRef, useState} from "react";
import "./infoprompt.scss"
import {Register} from "../api/api";
import {useNavigate} from "react-router-dom";
export function RegisterPrompt() {
    let login = useNavigate()
    let Username = createRef()
    let FirstPassword = createRef()
    let SecondPassword = createRef()
    const [registered,reg] = useState(false)
    const [submit,sub] = useState(false)
    const [passwordMismatch,mismatch] = useState(false)
    function UsernameHandler(e) {
        if (e.key === 'Enter' && Username.current.value !=='') {
            FirstPassword.current.focus()
        }
    }
    function FirstPasswordHandler(e) {
        if (e.key === 'Enter' && FirstPassword.current.value !== '') {
            SecondPassword.current.focus()
        }
    }

    function SecondPasswordHandler(e) {
        if (e.key === 'Enter' && Username.current.value !=='' && SecondPassword.current.value !== '' && FirstPassword.current.value !== '') {
            if (!passwordMismatch) {
                reg(Register(Username.current.value, FirstPassword.current.value))
                sub(true)
                setTimeout(()=> login("/login"),1000)
            }
        }
    }

    function RegisterClick() {
        if (Username.current.value !=='' && FirstPassword.current.value!=='' &&SecondPassword.current.value !== '' && !passwordMismatch) {
            reg(Register(Username.current.value, FirstPassword.current.value))
            sub(true)
            setTimeout(()=> login("/login"),1000)
        }
    }

    function InputChangeHandler() {
        if (FirstPassword.current.value !=='' && SecondPassword.current.value !== '') {
            if (SecondPassword.current.value !== FirstPassword.current.value) {
                mismatch(true)
            } else {
                mismatch(false)
            }
        }
        else mismatch(false)
        reg(false)
        sub(false)
    }

    return (
        <div className="InfoPrompt">
            <label className="InfoLabel" style={{fontSize: 20, textAlign: "center",}}>Authentication Required</label>
            <label className="InfoLabel" style={{fontSize: 14, marginLeft: 5, marginTop: 20, marginBottom: 10}}>
                Username:
                <input className="InfoText" ref={Username} onKeyDown={UsernameHandler} onChange={InputChangeHandler}/>
            </label>
            <label className="InfoLabel" style={{fontSize: 14, marginLeft: 5, marginTop: 20, marginBottom: 10}}>
                Password:
                <input type="password" className="InfoText" ref={FirstPassword} onKeyDown={FirstPasswordHandler} onChange={InputChangeHandler}/>
            </label>
            <label className="InfoLabel" style={{fontSize: 14, marginLeft: 5, marginTop: 20, marginBottom: 10}}>
                Re-enter Password:
                <input type="password" className="InfoText" ref={SecondPassword} onKeyDown={SecondPasswordHandler} onChange={InputChangeHandler}/>
            </label>
            {passwordMismatch ? <label style={{fontSize:16, marginLeft:5, color:"red"}}>Password does not match</label> : null}
            {(registered && submit) ? <label style={{fontSize: 16, marginLeft: 5, color: "green"}}>Successfully Registered. Redirecting...</label> : null}
            {(!registered && submit) ? <label style={{fontSize: 16, marginLeft: 5, color: "red"}}>User already existed.</label> : null}
            <button className="SubmitButton" onClick={RegisterClick}>Register</button>
        </div>
    )
}