import {channels, CreateChannel, RequestChannelList, SearchUser} from "../api/api";
import {Conversation} from "./conversation";
import "./conversationlist.scss"
import "./conversation.scss"
import {useContext, useEffect, useRef, useState} from "react";
import Popup from "reactjs-popup";
import {CurrentChatContext} from "../dashboard/dashboard";
import {ErrorNotification} from "../dashboard/notifications";
export function ConversationList(props) {
    const list = useContext(CurrentChatContext)
    const ref = useRef()
    const [channelList, updateList] = useState(channels)
    const [userList, changeUserList] = useState([])
    async function keyDownHandler(e) {
        if (e.key === 'Enter' && e.target.value !== "") {
            e.preventDefault()
            e.stopPropagation()
            if (await SearchUser(e.target.value)) {
                if (userList.findIndex((user) => {
                    return e.target.value === user
                }) === -1) {
                    changeUserList([...userList, e.target.value])
                    e.target.value = ''
                }
            }
            else {
                ErrorNotification(null, e.target.value + ": User does not exist.")
            }
        }
    }
    function CreateClick() {
        CreateChannel(userList).then(
            () => {
                RequestChannelList().then(
                    () => props.handler()
                )
                ref.current.close()
            }
        )
    }
    function RemoveUser(e,user) {
        changeUserList(userList.filter((_user) => _user !== user))
    }
    useEffect(() => {
        updateList(channels)
    }, [list]);
    return (
        <div className="ConversationList">
            <Popup position="right center" className="modal-popup"
            trigger={<button className="Conversation" style={{top:"0", height:"5%", borderWidth:"1px 0", borderStyle:"solid", position:"sticky"}}>New Chat</button>}
            ref={ref}
            onClose={() => changeUserList([])}
            modal nested>
                <input className="input" onKeyDown={keyDownHandler}/>
                    <div style={{overflow:"scroll", overflowX:"hidden",display:"block", width:"100%", height:"90%"}}>
                        {userList.map(user =>
                            <div key={user} style={{alignContent:"center",maxHeight:"10%", borderWidth: "1px", margin:"2px", borderStyle:"solid", display:"inline-block", background:"lightgray", padding:"3px 1px 3px 3px"}}>
                                {user}
                                <button onClick={(e) => RemoveUser(e,user)} className="remove-button">X</button>
                            </div>
                        )}
                    </div>
                <button onClick={CreateClick}>Create Channel</button>
            </Popup>
            {channelList.map(channel => <Conversation key={channel.ChannelID} handler={props.handler} ChannelID={channel.ChannelID} Title={channel.Title}/>)}
        </div>
    )
}