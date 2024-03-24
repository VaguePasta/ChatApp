import {Component, createRef} from "react";
import "./chatbox.scss"
import {send} from "../api/api"
class ChatBox extends Component {
    chatBoxRef = createRef()
    constructor(props) {
        super(props);
        this.state = {value : ''}
        this.changeHandler = this.changeHandler.bind(this)
        this.keyDownHandler = this.keyDownHandler.bind(this)
        this.sendHandler = this.sendHandler.bind(this)
    }

    render() {
        return (
            <div>
                <textarea ref={this.chatBoxRef} className = "ChatBox" value = {this.state.value} onKeyDown={this.keyDownHandler} onChange={this.changeHandler}/>
                <button className="SendButton" onClick={this.sendHandler}/>
            </div>
        )
    }
    sendHandler() {
        send(this.state.value)
        this.chatBoxRef.current.value =''
        this.setState({value: this.chatBoxRef.current.value})
        this.chatBoxRef.current.focus()
    }
    keyDownHandler(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            e.stopPropagation()
            send(this.state.value)
            e.target.value = ''
            this.setState({value: e.target.value})
            this.chatBoxRef.current.focus()
        }
    }
    changeHandler(e) {
            this.setState({value: e.target.value})
    }
}
export default ChatBox;