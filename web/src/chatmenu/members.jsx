import {useEffect, useState} from "react";
import {CurrentChannel} from "../conversation/conversation";
import "../chat/chatbox.scss"
import {ErrorNotification} from "../notifications/notifications";
import {ChangeUserPrivilege} from "../api/user";
import {User} from "../api/auth";
import {channels, RequestChatMember} from "../api/channel";
export let ChatMember = {
    CurrentList: 0,
    UserList: [],
    Privilege: null,
}
export function ResetMember() {
    ChatMember = {
        CurrentList: 0,
        UserList: [],
        Privilege: null,
    }
}
export function Members(props) {
    const [, forceRender] = useState(false)
    const [reloading, reload] = useState(false)
    useEffect(() => {
        if (props.showingMember && ChatMember.CurrentList !== CurrentChannel) {
            ChatMember.CurrentList = CurrentChannel
            ChatMember.UserList = null
            GetChatMember()
        }
        if (!props.showingMember) {
            reload(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[props.showingMember]);
    function GetChatMember() {
        forceRender(render => !render)
        RequestChatMember(CurrentChannel).then((list) => {
            if (list !== null) {
                let privilege = channels.find(obj => {return obj.ChannelID.valueOf() === CurrentChannel}).Privilege
                ChatMember = {
                    CurrentList: CurrentChannel,
                    Privilege: privilege,
                    UserList: list,
                }
            }
            else ChatMember = {
                CurrentList: CurrentChannel,
                Privilege: null,
                UserList: [],
            }
            forceRender(render => !render)
        })
    }
    function Reload() {
        reload(true)
        setTimeout(() => reload(false), 1000)
        GetChatMember()
    }
    if (ChatMember.UserList === null) {
        return (
            <div style={{flexShrink: "none", minWidth: "15%", maxWidth: "15%", flex: "1"}}>
                <div style={{
                    minHeight: "5%",
                    maxHeight: "5%",
                    lineHeight: "100%",
                    minWidth: "100%",
                    padding: "4px",
                    fontSize: "19px",
                    display: "flex",
                    alignItems: "center"
                }}>Chat member(s):
                    <button style={{float: "right"}} className="RemoveButton" onClick={() => props.showMem(false)}/>
                </div>
                <div className="loader"/>
            </div>
        )
    }
    return (
        <div style={{
            flexShrink: "none",
            minWidth: "15%",
            maxWidth: "15%",
            flex: "1",
            display: "flex",
            flexDirection: "column"
        }}>
            <div style={{
                minHeight: "5%",
                maxHeight: "5%",
                lineHeight: "100%",
                minWidth: "100%",
                padding: "4px",
                fontSize: "19px",
                display: "flex",
                alignItems:"center",
                justifyContent: "end",
            }}>Chat member(s):
                {reloading ? <button className="reload Reloading" onClick={Reload}/> :
                    <button className="reload" onClick={Reload}/>}
                <button style={{marginLeft: "0"}} className="RemoveButton" onClick={() => props.showMem(false)}/>
            </div>
            <div style={{overflow: "scroll", scrollbarWidth: "thin", overflowX: "hidden", borderTop: "1px solid", flex: "1"}}>
                {ChatMember.UserList.map(user => <Member key={user} forceRender={forceRender} privilege={ChatMember.Privilege} user={user}/>)}
            </div>
        </div>
    )
}
function Member(props) {
    function ChangePrivilege(e) {
        let newPrivilege = e.target.value
        ChangeUserPrivilege(props.user[0], CurrentChannel, newPrivilege).then((result) => {
            if (result) {
                ChatMember.UserList[ChatMember.UserList.findIndex((e) => e[0].valueOf() === props.user[0].valueOf())][2] = newPrivilege
                props.forceRender(render => !render)
            }
            else {
                ErrorNotification(props.user, "Cannot change user privilege. Please try again.")
            }
        })
    }
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
                }}>{props.user[1]}</div>
                <div style={{
                    fontSize: "12px",
                    margin: "0px 5px",
                    padding: "2px 1px",
                    color: "#248a92",
                    textTransform: "capitalize"
                }}>{props.user[2]}</div>
            </div>
            {(User.userid !== props.user[0].valueOf() && props.privilege === 'admin') &&
                <select value={props.user[2]} onChange={ChangePrivilege} className="select" style={{height: "70%", alignSelf: "center", flex: "1", width: "40%"}}>
                    <option disabled hidden value={props.user[2]}>{props.user[2][0].toUpperCase() + props.user[2].slice(1)}</option>
                    {props.user[2] !== "admin" && <option value="admin">Admin</option>}
                    {props.user[2] !== "moderator" && <option value="moderator">Moderator</option>}
                    {props.user[2] !== "member" && <option value="member">Member</option>}
                    {props.user[2] !== "viewer" && <option value="viewer">Viewer</option>}
                </select>
            }
            {(User.userid !== props.user[0].valueOf() && props.privilege === 'moderator' && props.user[2] !== 'admin' && props.user[2] !== 'moderator') &&
                <select value={props.user[2]} onChange={ChangePrivilege} className="select" style={{height: "70%", alignSelf: "center", flex: "1", width: "40%"}}>
                    <option disabled hidden value={props.user[2]}>{props.user[2][0].toUpperCase() + props.user[2].slice(1)}</option>
                    {props.user[2] !== "member" && <option value="member">Member</option>}
                    {props.user[2] !== "viewer" && <option value="viewer">Viewer</option>}
                </select>
            }
            {(User.userid !== props.user[0].valueOf() && props.privilege === 'moderator' && (props.user[2] === 'admin' || props.user[2] === 'moderator')) &&
                <select value={props.user[2][0].toUpperCase() + props.user[2].slice(1)} className="select"
                        style={{height: "70%", alignSelf: "center", flex: "1", marginRight: "5px"}} disabled>
                    <option disabled hidden>{props.user[2][0].toUpperCase() + props.user[2].slice(1)}</option>
                </select>
            }
            {(User.userid !== props.user[0].valueOf() && (props.privilege !== 'admin' && props.privilege !== 'moderator')) &&
                <select value={props.user[2][0].toUpperCase() + props.user[2].slice(1)} className="select"
                        style={{height: "70%", alignSelf: "center", flex: "1", marginRight: "5px"}} disabled>
                    <option disabled hidden>{props.user[2][0].toUpperCase() + props.user[2].slice(1)}</option>
                </select>
            }
        </div>
    )
}