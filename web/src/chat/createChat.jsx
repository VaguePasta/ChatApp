import {ErrorNotification} from "../dashboard/notifications";
import {CreateChannel, RequestChannelList, SearchUser, User} from "../api/api";
import {useRef} from "react";

export function CreateChat(props) {
    const ChannelName = useRef(null)
    function AddUser(user_id, username, privilege) {
        let exist = props.userList.findIndex(e => e[0] === user_id)
        if (exist !== -1) {
            let copy = [...props.userList]
            copy[exist] = [user_id, username, privilege]
            props.changeUserList(copy)
        } else {
            props.changeUserList([...props.userList, [user_id, username, privilege]])
        }
    }
    async function keyDownHandler(e) {
        if (e.key === 'Enter' && e.target.value !== "") {
            e.preventDefault()
            e.stopPropagation()
            if (e.target.value === User.username) {
                ErrorNotification("error-already-in", "You are already in the channel.")
                return
            }
            if (props.userList.findIndex((user) => {
                return e.target.value === user[1]
            }) !== -1) {
                ErrorNotification("error-person-already-in", "This user is already in the channel.")
                return
            }
            let response = await SearchUser(e.target.value)
            if (response.Status === 200) {
                let user_id = response.Response
                AddUser(user_id, e.target.value, "member")
                e.target.value = ''
            } else {
                ErrorNotification(null, e.target.value + ": User does not exist.")
            }
        }
    }
    function CreateClick() {
        if (ChannelName.current.value === "") {
            ErrorNotification("no-channel-name", "Please enter a name for the channel.")
            return
        }
        CreateChannel(ChannelName.current.value, props.userList).then(
            () => {
                RequestChannelList().then(
                    () => props.handler(false, true, true, false)
                )
                props.closePopup()
            },
            () => {
                ErrorNotification("create-channel-failed", "Cannot create channel. Please try again.")
            }
        )
    }
    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
        }}>
            <input ref={ChannelName} placeholder="Channel Name" className="input"/>
            <input placeholder="Add member..." className="input" onKeyDown={keyDownHandler}/>
            <div style={{
                overflow: "scroll",
                overflowX: "hidden",
                display: "block",
                width: "100%",
                height: "100%",
                scrollbarWidth: "thin"
            }}>
                {props.userList.map(user => <UserInChat key={user} user={user} changeUserList={props.changeUserList} userList={props.userList} addUser={AddUser}/>)}
            </div>
            <button style={{position: "absolute", top: "100%"}} onClick={CreateClick}>Create Channel</button>
        </div>
    )
}
function UserInChat(props) {
    function RemoveUser(e, user) {
        props.changeUserList(props.userList.filter((_user) => _user !== user))
    }
    function ChangePrivilege(e) {
        props.addUser(props.user[0], props.user[1], e.target.value)
    }
    return (
        <div key={props.user} style={{
            alignContent: "center",
            maxHeight: "12%",
            borderWidth: "1px",
            margin: "2px",
            borderStyle: "solid",
            display: "inline-flex",
            background: "lightgray",
            padding: "3px",
            maxWidth: "95%",
        }}>
            <div style={{
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "pre",
                marginRight: "7px",
                flex: "1",
            }}>{props.user[1]}</div>
            <select value={props.user[2]} className="select" style={{width: "70px", marginRight: "3px"}} onChange={ChangePrivilege}>
                <option value="admin">Admin</option>
                <option value="moderator">Moderator</option>
                <option value="member">Member</option>
                <option value="viewer">Viewer</option>
            </select>
            <button style={{flexShrink: "0", marginLeft: "auto"}} onClick={(e) => RemoveUser(e, props.user)}
                    className="remove-button">X
            </button>
        </div>
    )
}