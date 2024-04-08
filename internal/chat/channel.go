package chat

import (
	"github.com/sony/sonyflake"
)

var Setting sonyflake.Settings
var IdGenerator *sonyflake.Sonyflake
