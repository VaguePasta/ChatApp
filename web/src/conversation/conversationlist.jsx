import {channels} from "../api/api";
import {Conversation} from "./conversation";
import "./conversationlist.scss"
import "./conversation.scss"
import "../chatmenu/members.scss"
import {useContext, useEffect, useRef, useState} from "react";
import Popup from "reactjs-popup";
import {CurrentChatContext} from "../dashboard/dashboard";
import {CreateChat} from "../chat/createChat";
export function ConversationList(props) {
    const list = useContext(CurrentChatContext)
    const ref = useRef()
    const [channelList, updateList] = useState(channels)
    const [userList, changeUserList] = useState([])
    useEffect(() => {
        if (channels !== null)
            updateList([...channels])
    }, [list.Channels]);
    function closePopup() {
        ref.current.close()
    }
    return (
        <div style={{display: "flex", flexDirection: "column", width: "100%", height: "100%"}}>
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
                <CreateChat userList={userList} changeUserList={changeUserList} handler={props.handler} closePopup={closePopup}/>
            </Popup>
            <div className="ConversationList">
                {channelList !== null && channelList.map(channel => <Conversation key={channel.ChannelID.valueOf()} handler={props.handler}
                  ChannelID={channel.ChannelID.valueOf()} Title={channel.Title}/>)}
            </div>
        </div>
    )
}