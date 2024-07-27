package logger

import (
	"log"
	"os"
)

func OpenLog() bool {
	logfile, err := os.OpenFile(os.Getenv("LogLocation"), os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		logfile, err = os.OpenFile("error.log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
		if err != nil {
			return false
		}
	}
	log.SetOutput(logfile)
	return true
}
