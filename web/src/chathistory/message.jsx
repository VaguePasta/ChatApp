import {Component} from "react";
import "./message.scss"
class Message extends Component {
    constructor(props) {
        super(props);
        this.state = {
            message: this.props.message
        }
    }
    render() {
        return <div className="Message">{this.state.message}</div>
    }
}
export default Message;