package system

import (
	"ChatApp/internal/chat"
	"context"
	"errors"
	"fmt"
	"github.com/jackc/pgx/v5"
	"net/http"
)

func Register(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
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
	row := chat.DatabaseConn.QueryRow(context.Background(), "select 1 from users where username = $1 limit 1", username)
	err := row.Scan()
	if errors.Is(err, pgx.ErrNoRows) {
		_, err = chat.DatabaseConn.Exec(context.Background(), "insert into users (username, password, register_at) values($1, $2, (select current_date))", username, password)
		if err != nil {
			fmt.Println(err)
			return false
		}
		return true
	}
	return false
}
