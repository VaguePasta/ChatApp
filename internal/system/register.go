package system

import (
	"ChatApp/internal/connections"
	"context"
	"errors"
	"github.com/jackc/pgx/v5"
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
	row := connections.DatabaseConn.QueryRow(context.Background(), "select 1 from users where username = $1 limit 1", username)
	err := row.Scan()
	if errors.Is(err, pgx.ErrNoRows) {
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
		_, err = connections.DatabaseConn.Exec(context.Background(), "insert into users (username, password, register_at) values($1, $2, (select current_date))", username, hashedPassword)
		if err != nil {
			return false
		}
		return true
	}
	return false
}
