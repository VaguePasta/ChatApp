import {createRef, useState} from "react";
import "./infoprompt.scss"
import {useNavigate} from "react-router-dom";
import {Register} from "../api/auth";
export function RegisterPrompt() {
    let login = useNavigate()
    let Username = createRef()
    let FirstPassword = createRef()
    let SecondPassword = createRef()
    const [registered,reg] = useState(false)
    const [submit,sub] = useState(false)
    const [passwordMismatch,mismatch] = useState(false)
    const [capslock, toggleCaps] = useState(false)
    function CheckCaps(e) {
        if (e.getModifierState("CapsLock")) {
            toggleCaps(true)
        } else {
            toggleCaps(false)
        }
    }
    function UsernameHandler(e) {
        if (e.key === 'Enter' && Username.current.value !=='') {
            FirstPassword.current.focus()
            CheckCaps(e)
        }
    }
    function FirstPasswordHandler(e) {
        if (e.key === 'Enter' && FirstPassword.current.value !== '') {
            SecondPassword.current.focus()
        }
        else if (e.key === "CapsLock") CheckCaps(e)
    }

    async function SecondPasswordHandler(e) {
        if (e.key === 'Enter' && Username.current.value !=='' && SecondPassword.current.value !== '' && FirstPassword.current.value !== '') {
            if (!passwordMismatch) {
                await Register(Username.current.value, FirstPassword.current.value).then(
                    (result) => {
                        reg(result)
                        if (result) {
                            setTimeout(() => login("/login"), 1000)
                        }
                    }
                )
                sub(true)
            }
        }
        else if (e.key === "CapsLock") CheckCaps(e)
    }
    async function RegisterClick() {
        if (Username.current.value !=='' && FirstPassword.current.value!=='' &&SecondPassword.current.value !== '' && !passwordMismatch) {
            await Register(Username.current.value, FirstPassword.current.value).then(
                (result) => {
                    reg(result)
                    if (result) {
                        setTimeout(() => login("/login"), 1000)
                    }
                }
            )
            sub(true)
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
            <label className="InfoLabel" style={{fontSize: 20, textAlign: "center",}}>Create a new account</label>
                <input placeholder="Username" className="InfoText" ref={Username} onKeyDown={UsernameHandler} onChange={InputChangeHandler}/>
                <input placeholder="Password" type="password" className="InfoText" ref={FirstPassword} onKeyDown={FirstPasswordHandler}
                       onChange={InputChangeHandler}/>
                <input placeholder="Re-enter Password" type="password" className="InfoText" ref={SecondPassword} onKeyDown={SecondPasswordHandler}
                       onChange={InputChangeHandler}/>
            <div style={{flex:"1", marginBottom:5}}>
                {capslock ? <label className="InfoLabel" style={{fontSize: 14, marginLeft: 5, color: "green"}}>Caps Lock is on.</label> : false}
                {passwordMismatch ? <label style={{fontSize: 16, marginLeft: 5, color: "red"}}>Passwords do not match.</label> : null}
                {(registered && submit) ? <label style={{fontSize: 16, marginLeft: 5, color: "green"}}>Successfully Registered. Redirecting...</label> : null}
                {(!registered && submit) ? <label style={{fontSize: 16, marginLeft: 5, color: "red"}}>User already existed.</label> : null}
            </div>
            <label className="InfoLabel" style={{fontSize: 15}}>Already have an
                account? <a href="/login" className="InfoLabel" style={{fontSize: 15}}>Log In</a></label>
            <button className="SubmitButton" onClick={RegisterClick}>Register</button>
        </div>
    )
}