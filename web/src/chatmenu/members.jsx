import {useEffect, useState} from "react";
import {channels, RequestChatMember, User as user, User} from "../api/api";
import {CurrentChannel} from "../conversation/conversation";
import "../chat/chatbox.scss"
const ChatMember = {
    CurrentList: 0,
    UserList: [],
}
export function Members(props) {
    const [channelUsers, updateUser] = useState(ChatMember)
    useEffect(() => {
        if (ChatMember.CurrentList !== CurrentChannel) {
            GetChatMember()
        }
    });
    function GetChatMember() {
        if (CurrentChannel !== channelUsers.CurrentList) {
            RequestChatMember(CurrentChannel).then((list) => {
                if (list === null) {
                    updateUser({
                        CurrentList: 0,
                        UserList: null,
                    })
                }
                updateUser({
                    CurrentList: CurrentChannel,
                    UserList: list,
                })
            })
        }
    }
    if (channelUsers.CurrentList === 0) {
        return (
            <div style={{flexShrink: "none", minWidth: "15%", maxWidth: "15%"}}>Error</div>
        )
    }
    return (
        <div style={{flexShrink: "none", minWidth: "15%", maxWidth: "15%", flex: "1", display: "flex", flexDirection: "column"}}>
            <div style={{
                minHeight: "5%",
                maxHeight: "5%",
                lineHeight: "100%",
                minWidth: "100%",
                padding: "4px",
                fontSize: "19px",
                display:"flex",
                alignItems:"center"
            }}>Chat member(s):<button style={{float: "right"}} className="RemoveButton" onClick={() => props.showMem(false)}/></div>
            <div style={{overflow: "scroll", scrollbarWidth: "thin", overflowX: "hidden", borderTop: "1px solid", flex: "1"}}>
                {channelUsers.UserList !== null ? channelUsers.UserList.map(user => <Member user={user}/>) : <div className="loader"/>}
            </div>
        </div>
    )
}
function Member(props) {
    const [privilege, p] = useState(null)
    useEffect(() => {
        p(props.user[0] !== User.username && channels.find(obj => {
            return obj.ChannelID.valueOf() === CurrentChannel
        }).Privilege)
    },[props.user])
    return (
        <div style={{
            display: "flex",
            borderStyle: "solid",
            borderWidth: "0 0 1px 0",
            alignContent: "center",
            marginRight: "2px",
            alignItems: "center"
        }}>
            <div style={{
                display: "flex",
                flexFlow: "column",
                flex: "1",
                minWidth: "60%",
                maxWidth: "60%",
                alignContent: "center",
            }}>
                <div style={{
                    whiteSpace: "nowrap",
                    fontSize: "16px",
                    margin: "0px 5px",
                    padding: "2px 1px",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                }}>{props.user[0]}</div>
                <div style={{
                    fontSize: "12px",
                    margin: "0px 5px",
                    padding: "2px 1px",
                    color: "#248a92",
                    textTransform: "capitalize"
                }}>{props.user[1]}</div>
            </div>
            {(user.username !== props.user[0] && (privilege === 'admin' || privilege === 'moderator')) &&
                <select className="select" style={{height: "70%", alignSelf: "center", flex: "1", width: "40%"}}>
                    <option selected disabled hidden>{props.user[1][0].toUpperCase() + props.user[1].slice(1)}</option>
                    {props.user[1] !== "admin" && <option value="admin">Admin</option>}
                    {props.user[1] !== "moderator" && <option value="moderator">Moderator</option>}
                    {props.user[1] !== "member" && <option value="member">Member</option>}
                    {props.user[1] !== "viewer" && <option value="viewer">Viewer</option>}
                </select>
            }
            {(user.username !== props.user[0] && (privilege !== 'admin' && privilege !== 'moderator')) &&
                <select className="select" style={{height: "70%", alignSelf: "center", flex: "1", marginRight: "5px"}} disabled>
                    <option selected disabled hidden>{props.user[1][0].toUpperCase() + props.user[1].slice(1)}</option>
                </select>
            }
        </div>
    )
}