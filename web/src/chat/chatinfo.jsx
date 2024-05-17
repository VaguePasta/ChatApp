import {useContext, useEffect, useRef, useState} from "react";
import "./chatinfo.scss"
import {CurrentChannel, SetChannel} from "../conversation/conversation";
import {CurrentChatContext} from "../dashboard/dashboard";
import {channels, DeleteChannel, RequestChannelList} from "../api/api";
import Popup from "reactjs-popup";
export function ChatInfo(props) {
    const currentChat = useContext(CurrentChatContext)
    const [channelName, changeName] = useState("")
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
    return (
        <div className="ChatInfo">
            {channelName}
            <Popup ref={ref} trigger={<button style={{display:"inline-block", float:"right", marginRight:"3%"}}>X</button>}>
                <div>
                    <button onClick={DeleteChannelClick} style={{display:"block"}}>Delete Channel</button>
                </div>
            </Popup>
        </div>
    )
}