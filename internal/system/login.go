package system

import (
	"ChatApp/internal/connections"
	"net/http"
)

func LogIn(w http.ResponseWriter, r *http.Request) {
	origin := r.Header.Get("Origin")
	w.Header().Set("Access-Control-Allow-Origin", origin)
	err := r.ParseForm()
	if err != nil {
		return
	}
	credentials := connections.CheckCredentials(r.Form["username"][0], r.Form["password"][0])
	if credentials == "" {
		w.WriteHeader(401)
	} else {
		w.Header().Set("Content-Type", "text/plain")
		w.WriteHeader(200)
		_, err := w.Write([]byte(credentials))
		if err != nil {
			return
		}
	}
}
