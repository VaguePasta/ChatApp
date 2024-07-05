import {channels, CreateChannel, RequestChannelList, SearchUser} from "../api/api";
import {Conversation} from "./conversation";
import "./conversationlist.scss"
import "./conversation.scss"
import {useContext, useEffect, useRef, useState} from "react";
import Popup from "reactjs-popup";
import {CurrentChatContext} from "../dashboard/dashboard";
import {ErrorNotification} from "../dashboard/notifications";
import {username} from "../auth/login";
export function ConversationList(props) {
    const list = useContext(CurrentChatContext)
    const ref = useRef()
    const ChannelName = useRef(null)
    const [channelList, updateList] = useState(channels)
    const [userList, changeUserList] = useState([])

    async function keyDownHandler(e) {
        if (e.key === 'Enter' && e.target.value !== "") {
            e.preventDefault()
            e.stopPropagation()
            if (e.target.value === username) {
                ErrorNotification("error-already-in", "You are already in the channel.")
                return
            }
            if (userList.findIndex((user) => {
                return e.target.value === user[0]
            }) !== -1) {
                ErrorNotification("error-person-already-in", "This user is already in the channel.")
                return
            }
            let response = await SearchUser(e.target.value)
            if (response.Status === 200) {
                let user_id = response.Response
                console.log(user_id)
                changeUserList([...userList, [e.target.value, user_id]])
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
        CreateChannel(ChannelName.current.value, userList).then(
            () => {
                RequestChannelList().then(
                    () => props.handler()
                )
                ref.current.close()
            }
        )
    }

    function RemoveUser(e, user) {
        changeUserList(userList.filter((_user) => _user !== user))
    }
    useEffect(() => {
        updateList(channels)
    }, [list]);
    return (
        <div className="ConversationList">
            <Popup position="right center" className="modal-popup"
                   trigger={<button className="Conversation" style={{
                       top: "0",
                       height: "5%",
                       borderWidth: "1px 0",
                       borderStyle: "solid",
                       position: "sticky"
                   }}>New Chat</button>}
                   ref={ref}
                   onClose={() => changeUserList([])}
                   modal nested>
                <div style={{
                    display:"flex",
                    flexDirection:"column",
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
                        {userList.map(user =>
                            <div key={user} style={{
                                alignContent: "center",
                                maxHeight: "12%",
                                borderWidth: "1px",
                                margin: "2px",
                                borderStyle: "solid",
                                display: "inline-flex",
                                background: "lightgray",
                                padding: "3px 1px 3px 3px",
                                maxWidth: "20%",
                            }}>
                                <div style={{
                                    textOverflow:"ellipsis",
                                    overflow:"hidden",
                                    whiteSpace:"pre",
                                }}>{user[0]}</div>
                                <button style={{flexShrink:"0"}} onClick={(e) => RemoveUser(e, user)} className="remove-button">X</button>
                            </div>
                        )}
                    </div>
                    <button style={{position:"absolute", top:"100%"}} onClick={CreateClick}>Create Channel</button>
                </div>
            </Popup>
            {channelList.map(channel => <Conversation key={channel.ChannelID} handler={props.handler}
              ChannelID={channel.ChannelID} Title={channel.Title}/>)}
        </div>
    )
}