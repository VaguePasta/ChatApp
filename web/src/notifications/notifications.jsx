import {toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {LogIn, OpenSocket, User} from "../api/auth";
export const ErrorNotification = (id, error) => {
    if (toast.isActive(id)) {
        toast.update(id)
    }
    else {
        toast.error(error, {
            toastId: id,
            position: "bottom-left",
        })
    }
}
export const SuccessNotification = (id, notification) => {
    if (toast.isActive(id)) {
        toast.update(id)
    }
    else {
        toast.success(notification, {
            toastId: id,
            position: "bottom-left",
        })
    }
}
export function Reconnect(ref) {
    return new Promise((resolve) =>
    toast.promise(LogIn(User.username, User.password), {
        pending: "Connection lost. Reconnecting....",
        success: {
            render() {
                OpenSocket()
                resolve(true)
                return "Reconnected."
            }
        },
        error: {
            render() {
                setTimeout(ref.current.open(), 1500)
                resolve(false)
                return "Cannot connect to server"
            }
        }
    }))
}