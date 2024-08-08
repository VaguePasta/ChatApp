package net

import (
	"ChatApp/internal/connections"
	"ChatApp/internal/system"
	"github.com/gorilla/mux"
	"github.com/sony/sonyflake"
	"net/http"
	"time"
)

func SetupRoutes() *mux.Router {
	connections.Setting = sonyflake.Settings{
		StartTime:      time.Date(2024, time.May, 22, 0, 0, 0, 0, time.UTC).Local(),
		MachineID:      nil,
		CheckMachineID: nil,
	}
	IdGenerator, err := sonyflake.New(connections.Setting)
	if err != nil {
		return nil
	}
	connections.IdGenerator = IdGenerator
	router := mux.NewRouter()
	router.HandleFunc("/auth/login", system.LogIn)
	router.HandleFunc("/auth/register", system.Register)
	router.HandleFunc("/auth/password", ChangePassword)

	router.HandleFunc("/channel/read", GetChannelList)
	router.HandleFunc("/channel/create", CreateChannel)
	router.HandleFunc("/channel/delete", DeleteChannel)
	router.HandleFunc("/channel/member/{channelID}", GetChannelMember)
	router.HandleFunc("/channel/rename", ChangeChannelName)
	router.HandleFunc("/channel/leave", LeaveChannel)
	router.HandleFunc("/channel/privilege", ChangeUserPrivilege)
	router.HandleFunc("/channel/invite", ChannelCode)

	router.HandleFunc("/user/search/{username}", SearchUser)
	router.HandleFunc("/user/get/{userid}", GetUserInfo)
	router.HandleFunc("/user/join", JoinChannel)

	router.HandleFunc("/message/read/{channelID}/{lastMessage}", func(w http.ResponseWriter, r *http.Request) {
		GetChannelMessages(connections.ConnectionPool, w, r)
	})
	router.HandleFunc("/message/delete", func(w http.ResponseWriter, r *http.Request) {
		DeleteMessage(connections.ConnectionPool, w, r)
	})
	router.HandleFunc("/message/get", func(w http.ResponseWriter, r *http.Request) {
		GetMessage(connections.ConnectionPool, w, r)
	})
	router.HandleFunc("/ws/{token}", func(w http.ResponseWriter, r *http.Request) {
		ServeWs(connections.ConnectionPool, w, r)
	})

	return router
}
