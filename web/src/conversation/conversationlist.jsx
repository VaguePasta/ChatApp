import {CreateChannel, makeRequest, server, token} from "../api/api";
import {Conversation} from "./conversation";
import "./conversationlist.scss"
import {useContext, useEffect, useRef, useState} from "react";
import Popup from "reactjs-popup";
import {CurrentChatContext} from "../dashboard/dashboard";
export let channelsMap = new Map()
export let channels = []
export async function RequestChannelList() {
    let conn = new XMLHttpRequest()
    conn.open("GET","http" + server + "channel/read/" + token,true)
    channelsMap[0] = []
    let result = await makeRequest(conn,null)
    if (result.Response !== 'null') {
        channels = JSON.parse(result.Response)
        channels.forEach((element) => {
            channelsMap[element.ChannelID] = []
        })
    }
}
export function ConversationList(props) {
    const list = useContext(CurrentChatContext)
    const ref = useRef()
    const [channelList, updateList] = useState(channels)
    async function keyDownHandler(e) {
        if (e.key === 'Enter') {
            e.preventDefault()
            e.stopPropagation()
            if (await CreateChannel(e.target.value)) {
                await RequestChannelList()
                updateList(channels)
            }
            e.target.value = ''
            ref.current.close()
        }
    }
    useEffect(() => {
        updateList(channels)
    }, [list]);
    return (
        <div className="ConversationList">
            <Popup position="right center" trigger={<button style={{borderStyle:"solid", height:"5%",width:"100%"}}>New Chat</button>} ref={ref}>
                <div>
                    <label style={{fontSize:14, marginLeft:5, marginTop:20,marginBottom:10}} onKeyDown={keyDownHandler}>
                        Enter user(s): <input/>
                    </label>
                </div>
            </Popup>
            {channelList.map(channel => <Conversation handler={props.handler} ChannelID={channel.ChannelID} Title={channel.Title}/>)}
        </div>
    )
}