import {Component} from "react";
import Message from "./message";

class ChatHistory extends Component {
    render() {
        return (
            <div className="ChatHistory">
                    {this.props.chatHistory.map(msg => <Message message={msg.data} />)}
            </div>
        );
    }
}
export default ChatHistory;