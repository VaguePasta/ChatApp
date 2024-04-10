import "./message.scss"
export function Message(props) {
    return (
        <div className="Message">{props.message.TimeStamp}: {props.message.Text}</div>
    )
}