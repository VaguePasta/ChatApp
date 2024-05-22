import {useContext, useEffect, useRef, useState} from "react";
import "./chatinfo.scss"
import {CurrentChannel, SetChannel} from "../conversation/conversation";
import {CurrentChatContext} from "../dashboard/dashboard";
import {channels, DeleteChannel, RequestChannelList, RequestChatMember} from "../api/api";
import Popup from "reactjs-popup";
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
            }
        )
    }
    async function GetChatMember() {
        if (CurrentChannel !== channelUsers.CurrentList) {
            updateUser({
                CurrentList: CurrentChannel,
                UserList: await RequestChatMember(CurrentChannel),
            })
        }
    }
    return (
        <div className="ChatInfo">
            {channelName}
            <Popup ref={ref} trigger={<button style={{display:"inline-block", float:"right", marginRight:"3%"}}>X</button>}>
                <div>
                    <Popup className="tooltip-popup" onOpen={GetChatMember} trigger={<button>Chat member(s)...</button>} nested position="left top">
                        {channelUsers.UserList.map(user =>
                            <div style={{display:"flex", flexFlow:"column", borderStyle:"solid" ,borderWidth:"0 0 1px 0"}}>
                                <div style={{whiteSpace:"nowrap", fontSize:"16px",margin:"0px 5px", padding:"2px 1px", maxWidth:"200px", overflow:"clip"}}>{user[0]}</div>
                                <div style={{fontSize:"12px", margin:"0px 5px", padding:"2px 1px", color:"#248a92"}}>{user[1]}</div>
                            </div>)}
                    </Popup>
                    <button onClick={DeleteChannelClick} style={{display:"block"}}>Delete Channel</button>
                </div>
            </Popup>
        </div>
    )
}