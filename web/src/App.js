import {Component} from "react";
import {connect} from "./api/api"
import ChatHistory from "./chathistory/chatHistory";
import Header from "./header/header"
import ChatBox from "./chatbox/chatbox";
class App extends Component {
    history = []
    constructor(props) {
        super(props);
        this.state = {
            chatHistory : []
        }
    }
    componentDidMount() {
        connect((message) => {
            this.history.push(message)
            this.setState(() => ({
                chatHistory : this.history
            }))
        });
    }
    render() {
        return (
            <div className={App}>
                <Header/>
                <ChatHistory chatHistory = {this.state.chatHistory} />
                <ChatBox/>
            </div>
        )
    }
}
export default App;