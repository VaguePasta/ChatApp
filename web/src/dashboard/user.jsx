import {ConversationList} from "../conversation/conversationlist";
import {username} from "../auth/login";
import Popup from "reactjs-popup";
import {LogOut, RequestChannelList} from "../api/api";
import {useNavigate} from "react-router-dom";
import "./dashboard.scss"
import {useState} from "react";
export function User(props) {
    const [loaded, load] = useState(false)
    if (!loaded) {
        RequestChannelList().then(() => load(true))
    }
    let history = useNavigate()
    function Logout() {
        LogOut()
        load(false)
        history("/login", {replace: true})
    }

    function Profile() {
        history("/profile")
    }

    return (
        <div style={{width:"10%", display:"flex", flexFlow:"column"}}>
            <div style={{padding:" 5px 3px", fontSize:"20px", alignContent:"center", alignItems:"center"}}>{username}
                    <Popup trigger={<button className="User-Button"/>} nested position="bottom center">
                        <div style={{display:"flex", flexDirection:"column"}}>
                            <button onClick={Profile}>Profile</button>
                            <button onClick={Logout}>Log out</button>
                        </div>
                    </Popup>
            </div>
            {loaded ? <ConversationList handler={props.handler}/> : <div>Loading...</div>}
        </div>
    )
}