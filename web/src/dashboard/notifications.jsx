import {toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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