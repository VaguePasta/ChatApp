import {ConversationList} from "../conversation/conversationlist";
import Popup from "reactjs-popup";
import {channels, LogOut, RequestChannelList, user} from "../api/api";
import {useNavigate} from "react-router-dom";
import "./dashboard.scss"
import "../chat/chatinfo.scss"
import {useEffect, useState} from "react";
import {SetChannel} from "../conversation/conversation";
export function User(props) {
    const [loaded, load] = useState(() => {return channels !== null})
    useEffect(() => {
        if (channels === null) RequestChannelList().then(() => load(true))
    }, []);
    let history = useNavigate()
    function Logout() {
        LogOut()
        load(false)
        history("/login", {replace: true})
    }
    function Profile() {
        SetChannel(0)
        history("/profile")
    }

    return (
        <div style={{width:"10%", display:"flex", flexFlow:"column"}}>
            <div style={{padding:" 5px 3px", fontSize:"20px", alignContent:"center", alignItems:"center"}}>{user.username}
                    <Popup trigger={<button className="User-Button"/>} nested position="bottom center" className="tooltip-popup">
                        <div style={{display:"flex", flexDirection:"column"}}>
                            <button className="popup-button" style={{borderWidth: "0 0 1px 0"}} onClick={Profile}>Profile</button>
                            <button className="popup-button" onClick={Logout}>Log out</button>
                        </div>
                    </Popup>
            </div>
            {loaded ? <ConversationList handler={props.handler}/> : <div className="loader"/> }
        </div>
    )
}