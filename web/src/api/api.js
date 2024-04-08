export let token = "0";
let socket;
export function LogIn(_username, _password) {
     let log = new XMLHttpRequest();
     log.open("POST","http://localhost:8080/auth/login",false);
     log.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
     log.send('username=' + _username + '&password=' + _password);
     if (log.status === 401) {
          token = "0"
          return
     }
     token = log.responseText
     socket = new WebSocket("ws://localhost:8080/ws/"+token)
}
export function Register(_username, _password) {
     let log = new XMLHttpRequest();
     log.open("POST","http://localhost:8080/auth/register",false);
     log.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
     log.send('username=' + _username + '&password=' + _password);
     if (log.status === 409) return false
     else if (log.status === 201) return true
}
export let connect = data => {
     socket.onopen = () => {
          console.log("Successfully Connected");
     };
     socket.onmessage = msg => {
          console.log("message")
          data(msg)
     };
     socket.onclose = event => {
          console.log("Socket Closed Connection: ", event);
     };
     socket.onerror = error => {
          console.log("Socket Error: ", error);
     };
}
export let send = msg => {
     socket.send(msg);
};