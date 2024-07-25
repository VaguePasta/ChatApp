import {User} from "./auth";
import {stringify} from "lossless-json";
import {makeRequest, server} from "./api";

export async function SearchUser(_username) {
    let log = new XMLHttpRequest()
    log.open("GET", server + "user/search/" + _username, true)
    log.withCredentials = true;
    log.setRequestHeader('Authorization', User.token)
    return await makeRequest(log,null).then(
        (result) => {
            return result
        },
        (error) => {
            return error
        }
    )
}
export async function ChangePassword(oldPassword, newPassword) {
    let log = new XMLHttpRequest()
    log.open("POST", server + "auth/password")
    log.withCredentials = true
    log.setRequestHeader('Authorization', User.token)
    return await makeRequest(log, stringify([oldPassword, newPassword])).then(
        () => {
            return 200
        },
        (error) => {
            return error.Status
        }
    )
}
export async function RequestUserInfo(user_id) {
    let log = new XMLHttpRequest()
    log.open("GET", server + "user/get/" + user_id, true)
    log.withCredentials = true;
    log.setRequestHeader('Authorization', User.token)
    return await makeRequest(log,null).then(
        (result) => {
            User.joinDate = result.Response
            return true
        },
        () => {
            return false
        }
    )
}
export async function ChangeUserPrivilege(user_id, channel, privilege) {
    let log = new XMLHttpRequest()
    log.open("POST", server + "channel/privilege", true)
    log.withCredentials = true
    log.setRequestHeader('Authorization', User.token)
    return await makeRequest(log, stringify([user_id, channel, privilege])).then(
        () => {
            return true
        },
        () => {
            return false
        }
    )
}

export function UpdateUsername(_username) {
    User.username = _username
}