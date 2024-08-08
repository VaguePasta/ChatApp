import {ConversationList} from "../conversation/conversationlist";
import Popup from "reactjs-popup";
import {useNavigate} from "react-router-dom";
import "./dashboard.scss"
import "../chat/chatinfo.scss"
import {useEffect, useState} from "react";
import {CurrentChannel, SetChannel} from "../conversation/conversation";
import {LogOut, User} from "../api/auth";
import {channels, RequestChannelList} from "../api/channel";
export function Channel(props) {
    const [loaded, load] = useState(() => {return channels !== null})
    const [reloading, reload] = useState(false)
    useEffect(() => {
        if (channels === null) RequestChannelList(false).then(() => load(true))
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
    function ReloadList() {
        reload(true)
        setTimeout(() => reload(false), 1000)
        RequestChannelList(true).then(() => {
            if (channels.find(e => e.ChannelID.valueOf() === CurrentChannel) === undefined) {
                SetChannel(0)
                props.handler(true, true, false, false, false)
            }
            else props.handler(false, true, false, false, false)
        })
    }
    return (
        <div style={{width:"10%", display:"flex", flexFlow:"column", flexShrink: "0"}}>
            <div style={{
                padding: " 5px 3px",
                fontSize: "20px",
                alignContent: "center",
                alignItems: "center",
                display: "flex"
            }}>{User.username}
                    <button onClick={ReloadList} style={{marginLeft: "auto"}} className={"User-Button Reload " + (reloading && "Reloading")}/>
                    <Popup trigger={<button className="User-Button"/>} nested position="bottom center"
                           className="tooltip-popup">
                        <div style={{display: "flex", flexDirection: "column"}}>
                            <div>
                                <button className="popup-button" style={{borderWidth: "0 0 1px 0"}}
                                        onClick={Profile}>Profile
                                </button>
                            </div>
                            <button className="popup-button" onClick={Logout}>Log out</button>
                        </div>
                    </Popup>
            </div>
            {loaded ? <ConversationList handler={props.handler}/> : <div className="loader"/> }
        </div>
    )
}