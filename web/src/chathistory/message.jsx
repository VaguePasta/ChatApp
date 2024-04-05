import {Component} from "react";
import "./message.scss"
class Message extends Component {
    constructor(props) {
        super(props);
        let jsonObj = JSON.parse(this.props.message)
        this.state = {
            message: jsonObj
        }
    }
    render() {
        return <div className="Message">{this.state.message.TimeStamp}: {this.state.message.Text}</div>
    }
}
export default Message;