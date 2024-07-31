export function TimeStamp(props) {
    return (
        <div style={{
            position: "absolute",
            borderRadius: "5px 7px",
            textAlign: "center",
            top: props.offSet.top + props.plusHeight/2,
            left: props.isRight ? (props.offSet.left - 5) : (props.offSet.right + 5),
            transform: props.isRight ? "translate(-100%, -50%)" : "translate(0, -50%)",
            height: "fit-content",
            width: "fit-content",
            background: "white",
            color: "black",
            border: "1px solid black",
            padding: "5px",
            whiteSpace: "nowrap"
        }}>{props.timeStamp}</div>
    )
}