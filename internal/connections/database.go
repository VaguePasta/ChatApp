package connections

import (
	"bufio"
	"context"
	"crypto/rand"
	"encoding/hex"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/sony/sonyflake"
	"golang.org/x/crypto/bcrypt"
	"log"
	"os"
)

var Setting sonyflake.Settings
var IdGenerator *sonyflake.Sonyflake
var DatabaseConn *pgxpool.Pool

func DatabaseConnect() {
	DatabaseCredentials, err := os.Open(os.Getenv("DatabaseCred"))
	if err != nil {
		log.Fatal("FATAL: Cannot connect to database. " + err.Error())
	}
	scanner := bufio.NewScanner(DatabaseCredentials)
	info := new([]string)
	for scanner.Scan() {
		*info = append(*info, scanner.Text())
	}
	DatabaseURL := "postgresql://" + (*info)[0] + ":" + (*info)[1] + "@" + (*info)[2] + ":" + (*info)[3] + "/" + (*info)[4] + "?pool_max_conns=95"
	DatabaseConn, err = pgxpool.New(context.Background(), DatabaseURL)
	if err != nil {
		log.Fatal("FATAL: Cannot connect to database. " + err.Error())
	}
}
func CheckPassword(userid int, password string) (bool, string) {
	var _password string
	err := DatabaseConn.QueryRow(context.Background(), "select password from users where user_id = $1", userid).Scan(&_password)
	if err != nil {
		return false, _password
	}
	err = bcrypt.CompareHashAndPassword([]byte(_password), []byte(password))
	if err != nil {
		return false, _password
	}
	return true, _password
}
func CheckCredentials(username string, password string) string {
	var userid, _username, _password string
	err := DatabaseConn.QueryRow(context.Background(), "select user_id, username, password from users where username=$1", username).Scan(&userid, &_username, &_password)
	if err != nil {
		log.Println(err)
		return ""
	}
	err = bcrypt.CompareHashAndPassword([]byte(_password), []byte(password))
	if err != nil {
		return ""
	}
	b := make([]byte, 8)
	if _, err := rand.Read(b); err != nil {
		return ""
	}
	token := hex.EncodeToString(b)
	_, err = DatabaseConn.Exec(context.Background(), "insert into sessions (user_id, session_key) VALUES ($1,$2)", userid, token)
	if err != nil {
		log.Println(err)
		return ""
	}
	return userid + "/" + token
}
