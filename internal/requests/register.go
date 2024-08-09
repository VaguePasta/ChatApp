package requests

import (
	"ChatApp/internal/system"
	"context"
	"golang.org/x/crypto/bcrypt"
	"net/http"
)

func Register(w http.ResponseWriter, r *http.Request) {
	origin := r.Header.Get("Origin")
	w.Header().Set("Access-Control-Allow-Origin", origin)
	err := r.ParseForm()
	if err != nil {
		return
	}
	if !CheckRegister(r.Form["username"][0], r.Form["password"][0]) {
		w.WriteHeader(409) //Username already existed
		return
	}
	w.WriteHeader(201)
}
func CheckRegister(username string, password string) bool {
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	commandTag, err := system.DatabaseConn.Exec(context.Background(), "insert into users (username, password, register_at) values($1, $2, (select current_date)) on conflict do nothing", username, hashedPassword)
	if err != nil || commandTag.RowsAffected() == 0 {
		return false
	}
	return true
}
