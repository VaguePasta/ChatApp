import {Conversation} from "./conversation";
import "./conversationlist.scss"
import "./conversation.scss"
import "../chatmenu/members.scss"
import {useContext, useEffect, useRef, useState} from "react";
import Popup from "reactjs-popup";
import {CurrentChatContext} from "../dashboard/dashboard";
import {CreateChat} from "../chat/createChat";
import {channels, JoinChannelFromCode, RequestChannelList} from "../api/channel";
import {ErrorNotification} from "../notifications/notifications";
export function ConversationList(props) {
    const list = useContext(CurrentChatContext)
    const ref = useRef()
    const joinRef = useRef()
    const [channelList, updateList] = useState(channels)
    const [userList, changeUserList] = useState([])
    useEffect(() => {
        if (channels !== null)
            updateList([...channels])
    }, [list.Channels]);
    function closePopup() {
        ref.current.close()
    }
    function joinInputKeyHandler(e) {
        if (e.key === "Enter" && e.target.value !== "") {
            JoinChannelFromCode(e.target.value).then(
                () => {
                    joinRef.current.close()
                    RequestChannelList(false).then(() => {
                        props.handler(false, true, false, false, false)
                    })
                },
                () => {
                    ErrorNotification("Join-code-error", "Cannot join channel.")
                })
        }
    }
    return (
        <div style={{display: "flex", flexDirection: "column", width: "100%", height: "100%"}}>
            <Popup position="right center" className="modal-popup"
                   trigger={<button className="Conversation" style={{
                       top: "0",
                       height: "5%",
                       borderWidth: "1px 0 0 0",
                       borderStyle: "solid",
                       position: "sticky"
                   }}>New Channel</button>}
                   ref={ref}
                   onClose={() => changeUserList([])}
                   modal nested>
                <CreateChat userList={userList} changeUserList={changeUserList} handler={props.handler}
                            closePopup={closePopup}/>
            </Popup>
            <Popup position="center" ref={joinRef}
                   trigger={<button className="Conversation" style={{
                top: "0",
                height: "5%",
                borderWidth: "1px 0",
                borderStyle: "solid",
                position: "sticky"
            }}>Join Channel
            </button>}>
                   <input onKeyDown={joinInputKeyHandler}
                       style={{
                           padding: "3px",
                           transform: "translate(5%, 0)",
                           fontFamily: "\"Roboto Slab\", serif",
                           fontOpticalSizing: "auto",
                           fontWeight: "300",
                           fontSize: "15px",
                           fontStyle: "normal"}} placeholder="Enter channel code..."/>
            </Popup>
            <div className="ConversationList">
                {channelList !== null && channelList.map(channel => <Conversation key={channel.ChannelID.valueOf()}
                                                                                  handler={props.handler}
                                                                                  ChannelID={channel.ChannelID.valueOf()}
                                                                                  Title={channel.Title}/>)}
            </div>
        </div>
    )
}