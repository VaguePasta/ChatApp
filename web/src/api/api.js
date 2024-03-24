let socket = new WebSocket("ws://localhost:8080/ws")

export let connect = data => {
    socket.onopen = () => {
        console.log("Connection ok.")
    };
    socket.onclose = () => {
        console.log("Connection closed.")
    }
    socket.onerror = () => {
        console.log("Connection error.")
    }
    socket.onmessage = message => {
        data(message)
    }
}
export let send = message => {
    socket.send(message)
}