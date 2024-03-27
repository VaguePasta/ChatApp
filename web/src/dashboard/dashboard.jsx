import Header from "../header/header";
import ChatBox from "../chatbox/chatbox";
import ChatHistory from "../chathistory/chatHistory";
import {Component} from "react";
import {connect, token} from "../api/api";
import {Navigate} from "react-router-dom";
class Dashboard extends Component {
    history = []
    constructor(props) {
        super(props);
        this.state = {
            chatHistory : []
        }
    }
    componentDidMount() {
        if (token !== "0") {
            connect((message) => {
                this.history.push(message)
                this.setState(() => ({
                    chatHistory: this.history
                }))
            });
        }
    }
    render () {
        if (token === "0") {
            return <Navigate replace to="/login"/>
        }
        return (
            <div>
                <Header/>
                <ChatHistory chatHistory={this.state.chatHistory}/>
                <ChatBox/>
            </div>
        )
    }
}
export default Dashboard;