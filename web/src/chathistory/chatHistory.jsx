import {Component, createRef} from "react";
import Message from "./message";
import "./chatHistory.scss"
class ChatHistory extends Component {
    ref = createRef()
    render() {
        return (
            <div className="ChatHistory">
                    {this.props.chatHistory.map(msg => <Message message={msg.data} />)}
                <div ref={this.ref}/>
            </div>
        );
    }
    componentDidUpdate(prevProps, prevState, snapshot) {
        this.ref.current.scrollIntoView();
    }
}
export default ChatHistory;