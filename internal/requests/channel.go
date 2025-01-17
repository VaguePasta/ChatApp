package requests

import (
	"ChatApp/internal/system"
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"github.com/alphadose/haxmap"
	"github.com/gorilla/mux"
	"github.com/jackc/pgx/v5"
	"io"
	"log"
	"net/http"
	"strconv"
)

type Channel struct {
	ChannelID uint
	Title     string
	Privilege string
	Code      *string
}

func GetChannelList(w http.ResponseWriter, r *http.Request) {
	if !Authorize(w, r) {
		w.WriteHeader(401)
		return
	}
	user, ok := system.ConnectionPool.Clients.Get(r.Header.Get("Authorization"))
	if !ok {
		w.WriteHeader(404)
		return
	}
	force := mux.Vars(r)["force"]
	var channelIDs []Channel
	channels, _ := system.DatabaseConn.Query(context.Background(), "select channels.channel_id, title, privilege, code from channels inner join participants on channels.channel_id = participants.channel_id left join invite_code on channels.channel_id = invite_code.channel_id where user_id = $1 order by last_message desc", user.ID)
	var channelID uint
	var title string
	var privilege string
	var inviteCode *string
	_, err := pgx.ForEachRow(channels, []any{&channelID, &title, &privilege, &inviteCode}, func() error {
		channelIDs = append(channelIDs, Channel{ChannelID: channelID, Title: title, Privilege: privilege, Code: inviteCode})
		if force == "force" {
			user.Channels.List.Set(channelID, system.SaveClientsChannelPrivilege(privilege))
			channel, ok := system.ConnectionPool.Channels.Get(channelID)
			if !ok {
				channel = &system.Channel{
					UserList: haxmap.New[string, *system.Client](),
				}
				system.ConnectionPool.Channels.Set(channelID, channel)
				channel.UserList.Set(user.Token, user)
			} else {
				channel.UserList.Set(user.Token, user)
			}
		}
		return nil
	})
	if err != nil {
		log.Println(err)
		w.WriteHeader(500)
		return
	}
	bytes, err := json.Marshal(channelIDs)
	_, _ = w.Write(bytes)
	if err != nil {
		return
	}
}
func CreateChannel(w http.ResponseWriter, r *http.Request) {
	if !Authorize(w, r) {
		w.WriteHeader(401)
		return
	}
	sender, ok := system.ConnectionPool.Clients.Get(r.Header.Get("Authorization"))
	if !ok {
		w.WriteHeader(401)
		return
	}
	body, err := io.ReadAll(r.Body)
	var arr []json.RawMessage
	err = json.Unmarshal(body, &arr)
	if err != nil {
		w.WriteHeader(400)
		return
	}
	createTime, _ := system.IdGenerator.NextID()
	var channelId uint
	var channelName string
	err = json.Unmarshal(arr[0], &channelName)
	if err != nil {
		w.WriteHeader(400)
		return
	}
	err = system.DatabaseConn.QueryRow(context.Background(), "insert into channels (title, create_date, last_message) values ($1, (select current_date), $2) returning channel_id", channelName, createTime).Scan(&channelId)
	if err != nil {
		w.WriteHeader(500)
		return
	}
	arr = arr[1:]
	var users [][]interface{}
	for _, element := range arr {
		var user []interface{}
		err = json.Unmarshal(element, &user)
		if err != nil {
			w.WriteHeader(400)
			return
		}
		users = append(users, []interface{}{
			user[0],
			channelId,
			user[1],
		})
	}
	_, err = system.DatabaseConn.CopyFrom(context.Background(), pgx.Identifier{"participants"}, []string{"user_id", "channel_id", "privilege"}, pgx.CopyFromRows(users))
	if err != nil {
		log.Println(err)
		w.WriteHeader(500)
		return
	}
	sender.Channels.List.Set(channelId, 0)
	newChannel := &system.Channel{
		UserList: haxmap.New[string, *system.Client](),
	}
	system.ConnectionPool.Channels.Set(channelId, newChannel)
	rows, err := system.DatabaseConn.Query(context.Background(), "select session_key from sessions inner join participants on sessions.user_id = participants.user_id where participants.channel_id = $1", channelId)
	if err != nil {
		w.WriteHeader(500)
		return
	}
	for rows.Next() {
		var sessionKey string
		err := rows.Scan(&sessionKey)
		if err != nil {
			continue
		}
		member, _ := system.ConnectionPool.Clients.Get(sessionKey)
		newChannel.UserList.Set(sessionKey, member)
	}
	w.WriteHeader(201)
}
func DeleteChannel(w http.ResponseWriter, r *http.Request) {
	if !Authorize(w, r) {
		w.WriteHeader(401)
		return
	}
	body, err := io.ReadAll(r.Body)
	if err != nil {
		w.WriteHeader(400)
		return
	}
	var arr []uint
	err = json.Unmarshal(body, &arr)
	if err != nil {
		w.WriteHeader(400)
		return
	}
	sender, ok := system.ConnectionPool.Clients.Get(r.Header.Get("Authorization"))
	if !ok {
		w.WriteHeader(401)
		return
	}
	privilege, ok := sender.Channels.List.Get(arr[1])
	if !ok || privilege != 0 {
		w.WriteHeader(403)
		return
	}
	_, err = system.DatabaseConn.Exec(context.Background(), "delete from channels where channel_id = $1", arr[1])
	if err != nil {
		log.Println(err)
		w.WriteHeader(500)
		return
	}
	channel, _ := system.ConnectionPool.Channels.Get(arr[1])
	channel.UserList.ForEach(func(token string, client *system.Client) bool {
		client.Channels.List.Del(arr[1])
		return true
	})
	system.ConnectionPool.Channels.Del(arr[1])
	w.WriteHeader(200)
}
func GetChannelMember(w http.ResponseWriter, r *http.Request) {
	if !Authorize(w, r) {
		w.WriteHeader(401)
		return
	}
	channel, _ := strconv.ParseUint(mux.Vars(r)["channelID"], 10, 32)
	user, _ := system.ConnectionPool.Clients.Get(r.Header.Get("Authorization"))
	_, ok := user.Channels.List.Get(uint(channel))
	if !ok {
		w.WriteHeader(403)
		return
	}
	var members []interface{}
	rows, _ := system.DatabaseConn.Query(context.Background(), "select users.user_id, username, privilege from participants inner join users on participants.user_id = users.user_id where channel_id = $1 order by privilege, username", channel)
	for rows.Next() {
		var userId int
		var user [2]string
		err := rows.Scan(&userId, &user[0], &user[1])
		if err != nil {
			continue
		}
		userInfo := []interface{}{userId, user[0], user[1]}
		members = append(members, userInfo)
	}
	memberList, err := json.Marshal(members)
	if err != nil {
		log.Println(err)
		w.WriteHeader(500)
		return
	}
	_, err = w.Write(memberList)
	if err != nil {
		log.Println(err)
		w.WriteHeader(500)
		return
	}
}
func ChangeChannelName(w http.ResponseWriter, r *http.Request) {
	if !Authorize(w, r) {
		w.WriteHeader(401)
		return
	}
	body, err := io.ReadAll(r.Body)
	if err != nil {
		w.WriteHeader(400)
		return
	}
	arr := struct {
		Channel uint   `json:"Channel"`
		Name    string `json:"Name"`
	}{}
	err = json.Unmarshal(body, &arr)
	if err != nil {
		w.WriteHeader(400)
		return
	}
	sender, ok := system.ConnectionPool.Clients.Get(r.Header.Get("Authorization"))
	if !ok {
		w.WriteHeader(401)
		return
	}
	privilege, ok := sender.Channels.List.Get(arr.Channel)
	if !ok || privilege != 0 {
		w.WriteHeader(403)
		return
	}
	_, err = system.DatabaseConn.Exec(context.Background(), "update channels set title = $1 where channel_id = $2", arr.Name, arr.Channel)
	if err != nil {
		log.Println(err)
		w.WriteHeader(500)
		return
	}
	w.WriteHeader(200)
}
func LeaveChannel(w http.ResponseWriter, r *http.Request) {
	if !Authorize(w, r) {
		w.WriteHeader(401)
		return
	}
	user, ok := system.ConnectionPool.Clients.Get(r.Header.Get("Authorization"))
	if !ok {
		w.WriteHeader(401)
		return
	}
	body, err := io.ReadAll(r.Body)
	if err != nil {
		w.WriteHeader(400)
		return
	}
	var infos []uint
	err = json.Unmarshal(body, &infos)
	if err != nil {
		w.WriteHeader(400)
		return
	}
	if len(infos) == 1 {
		currentPrivilege, _ := user.Channels.List.Get(infos[0])
		if currentPrivilege == 0 {
			w.WriteHeader(403)
			return
		} else {
			_, err := system.DatabaseConn.Exec(context.Background(), "delete from participants where user_id = $1 and channel_id = $2", user.ID, infos[0])
			if err != nil {
				w.WriteHeader(500)
				return
			}
			user.Channels.List.Del(infos[0])
			_channel, ok := system.ConnectionPool.Channels.Get(infos[0])
			if !ok {
				w.WriteHeader(200)
				return
			}
			_channel.UserList.Del(user.Token)
		}
		w.WriteHeader(200)
		return
	} else if len(infos) == 2 { //[UserID, ChannelID]
		senderPrivilege, _ := user.Channels.List.Get(infos[1])
		if senderPrivilege != 0 && senderPrivilege != 1 {
			w.WriteHeader(403)
			return
		}
		receiver, ok := system.ConnectionPool.ClientChannels.Get(infos[0])
		if ok {
			receiverPrivilege, _ := receiver.List.Get(infos[1])
			if receiverPrivilege == 0 {
				w.WriteHeader(403)
				return
			}
			_, err = system.DatabaseConn.Exec(context.Background(), "delete from participants where user_id = $1 and channel_id = $2", infos[0], infos[1])
			if err != nil {
				w.WriteHeader(500)
				return
			}
			receiver.List.Del(infos[1])
			_channel, ok := system.ConnectionPool.Channels.Get(infos[1])
			if !ok {
				w.WriteHeader(200)
				return
			}
			_channel.UserList.ForEach(func(token string, client *system.Client) bool {
				if client.ID == infos[0] {
					_channel.UserList.Del(client.Token)
				}
				return true
			})
		} else {
			var receiverPrivilege string
			err := system.DatabaseConn.QueryRow(context.Background(), "select privilege from participants where user_id = $1 and channel_id = $2", infos[0], infos[1]).Scan(&receiverPrivilege)
			if err != nil {
				if errors.Is(err, pgx.ErrNoRows) {
					w.WriteHeader(404)
					return
				} else {
					w.WriteHeader(500)
					return
				}
			}
			if receiverPrivilege == "admin" {
				w.WriteHeader(403)
				return
			}
			_, err = system.DatabaseConn.Exec(context.Background(), "delete from participants where user_id = $1 and channel_id = $2", infos[0], infos[1])
			if err != nil {
				w.WriteHeader(500)
				return
			}
			_channel, ok := system.ConnectionPool.Channels.Get(infos[1])
			if !ok {
				w.WriteHeader(200)
				return
			}
			_channel.UserList.Del(user.Token)
		}
	}
}
func JoinChannel(w http.ResponseWriter, r *http.Request) {
	if !Authorize(w, r) {
		w.WriteHeader(401)
		return
	}
	sender, ok := system.ConnectionPool.Clients.Get(r.Header.Get("Authorization"))
	if !ok {
		w.WriteHeader(401)
		return
	}
	body, err := io.ReadAll(r.Body)
	if err != nil {
		w.WriteHeader(400)
		return
	}
	var inviteCode string
	err = json.Unmarshal(body, &inviteCode)
	if err != nil {
		w.WriteHeader(400)
		return
	}
	var channel uint
	err = system.DatabaseConn.QueryRow(context.Background(), "insert into participants values($1, (select channel_id from invite_code where code = $2), 'member') on conflict do nothing returning channel_id", sender.ID, inviteCode).Scan(&channel)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			w.WriteHeader(409)
			return
		} else {
			w.WriteHeader(403)
			return
		}
	}
	sender.Channels.List.Set(channel, 2)
	_channel, ok := system.ConnectionPool.Channels.Get(channel)
	if !ok {
		w.WriteHeader(200)
		return
	}
	_channel.UserList.Set(sender.Token, sender)
}
func ChannelCode(w http.ResponseWriter, r *http.Request) {
	if !Authorize(w, r) {
		w.WriteHeader(401)
		return
	}
	body, err := io.ReadAll(r.Body)
	if err != nil {
		w.WriteHeader(400)
		return
	}
	var bodyInfo []uint //[0|1,channel_id]  0: Create/modify code, 1: Delete code
	err = json.Unmarshal(body, &bodyInfo)
	if err != nil {
		w.WriteHeader(400)
		return
	}
	user, ok := system.ConnectionPool.Clients.Get(r.Header.Get("Authorization"))
	if !ok {
		w.WriteHeader(401)
		return
	}
	privilege, ok := user.Channels.List.Get(bodyInfo[1])
	if !ok || privilege != 0 {
		w.WriteHeader(401)
		return
	}
	if bodyInfo[0] == 0 {
		randomBytes := make([]byte, 4)
		_, err = rand.Read(randomBytes)
		if err != nil {
			w.WriteHeader(500)
			return
		}
		code := hex.EncodeToString(randomBytes)
		_, err := system.DatabaseConn.Exec(context.Background(), "insert into invite_code values($1, $2) on conflict (channel_id) do update set code = excluded.code", bodyInfo[1], code)
		if err != nil {
			w.WriteHeader(500)
			return
		}
		_, err = w.Write([]byte(code))
		if err != nil {
			w.WriteHeader(200)
			return
		}
		return
	} else if bodyInfo[1] == 1 {
		_, err := system.DatabaseConn.Exec(context.Background(), "delete from invite_code where channel_id = $1", bodyInfo[1])
		if err != nil {
			w.WriteHeader(500)
			return
		}
	}
}
