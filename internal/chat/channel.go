package chat

import (
	"context"
	"encoding/json"
	"github.com/gorilla/mux"
	"github.com/sony/sonyflake"
	"net/http"
)

type Channel struct {
	ChannelID int
	Title     string
}

func GetChatData(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	token := mux.Vars(r)["token"]
	var userid int
	err := DatabaseConn.QueryRow(context.Background(), "select user_id from sessions where session_key=$1", token).Scan(&userid)
	if err != nil {
		w.WriteHeader(404)
		return
	}
	var channelIDs []Channel
	channels, _ := DatabaseConn.Query(context.Background(), "select channel_id, title from channels where channel_id in (select channel_id from participants where user_id = $1) order by last_message", userid)
	for channels.Next() {
		var channelID int
		var title string
		err := channels.Scan(&channelID, &title)
		if err != nil {
			return
		}
		channelIDs = append(channelIDs, Channel{ChannelID: channelID, Title: title})
	}
	channels.Close()
	bytes, err := json.Marshal(channelIDs)
	_, _ = w.Write(bytes)
	if err != nil {
		return
	}
}

var Setting sonyflake.Settings
var IdGenerator *sonyflake.Sonyflake
