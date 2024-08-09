package system

import (
	"bufio"
	"context"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/sony/sonyflake"
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
	DatabaseConn, err = pgxpool.New(context.Background(), "postgresql://"+(*info)[0]+":"+(*info)[1]+"@"+(*info)[2]+":"+(*info)[3]+"/"+(*info)[4]+"?pool_max_conns=95")
	if err != nil {
		log.Fatal("FATAL: Cannot connect to database. " + err.Error())
	}
	_, _ = DatabaseConn.Exec(context.Background(), "truncate table sessions")
	_, _ = DatabaseConn.Exec(context.Background(), "insert into messages(message_id) values(0) on conflict do nothing")
}
