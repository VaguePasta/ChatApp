import {useContext, useEffect, useRef, useState} from "react";
import "./chatinfo.scss"
import {CurrentChannel, SetChannel} from "../conversation/conversation";
import {CurrentChatContext} from "../dashboard/dashboard";
import {
    ChangeChannelName,
    channels,
    DeleteChannel,
    RequestChannelList,
    RequestChatMember,
} from "../api/api";
import Popup from "reactjs-popup";
import {ErrorNotification} from "../dashboard/notifications";
export function ChatInfo(props) {
    const currentChat = useContext(CurrentChatContext)
    const [channelName, changeName] = useState("")
    const [channelUsers, updateUser] = useState({
        CurrentList: 0,
        UserList: [],
    })
    const ref = useRef()
    useEffect(() => {
        if (CurrentChannel === 0) {
            changeName("")
            return
        }
        changeName(channels.find(obj => {
            return obj.ChannelID === CurrentChannel
        }).Title)
    }, [currentChat]);
    async function DeleteChannelClick() {
        ref.current.close()
        DeleteChannel(CurrentChannel).then(
            (result) => {
                if (result) {
                    RequestChannelList().then(
                        () => {
                            SetChannel(0)
                            props.handler()
                        }
                    )
                }
                else {
                    ErrorNotification("no-privilege", "Admin privilege required.")
                }
            }
        )
    }
    async function GetChatMember() {
        if (CurrentChannel !== channelUsers.CurrentList) {
            let list = await RequestChatMember(CurrentChannel)
            if (list === null) {
                ref.current.close()
                return
            }
            updateUser({
                CurrentList: CurrentChannel,
                UserList: list,
            })
        }
    }

    async function ChangeName(e) {
        if (e.key === 'Enter' && e.target.value !== "") {
            ref.current.close()
            e.preventDefault()
            e.stopPropagation()
            if (await ChangeChannelName(CurrentChannel, e.target.value) === true) {
                changeName(e.target.value)
                await RequestChannelList()
                props.handler()
            }
            else {
                ErrorNotification("no-privilege", "Admin privilege required.")
            }
        }
    }

    return (
        <div className="ChatInfo">
            {channelName}
            <Popup position="bottom right" className="tooltip-popup" ref={ref} trigger={<button style={{height:"70%", aspectRatio:"1/1", marginLeft:"auto"}}>X</button>}>
                <div>
                    <Popup trigger={<button className="popup-button">Change Channel Name</button>}>
                        <input onKeyDown={ChangeName}/>
                    </Popup>
                    <Popup className="tooltip-popup" onOpen={GetChatMember} trigger={<button style={{borderWidth:"1px 0"}} className="popup-button">Chat member(s)...</button>} nested position="left top">
                        {channelUsers.UserList.map(user =>
                            <div style={{display:"flex", flexFlow:"column", borderStyle:"solid" ,borderWidth:"0 0 1px 0"}}>
                                <div style={{whiteSpace:"nowrap", fontSize:"16px",margin:"0px 5px", padding:"2px 1px", maxWidth:"200px", overflow:"clip"}}>{user[0]}</div>
                                <div style={{fontSize:"12px", margin:"0px 5px", padding:"2px 1px", color:"#248a92", textTransform:"capitalize"}}>{user[1]}</div>
                            </div>)}
                    </Popup>
                    <button onClick={DeleteChannelClick} className="popup-button">Delete Channel</button>
                </div>
            </Popup>
        </div>
    )
}