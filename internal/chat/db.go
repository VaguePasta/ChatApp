package chat

import (
	"github.com/jackc/pgx/v5/pgxpool"
)

var DatabaseConn *pgxpool.Pool
