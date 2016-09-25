package main

import (
	"net/http"
	"strings"
	"encoding/base64"
)

type BasicAuth struct {
	username string
	password string
}

type BasicHandlerFunc func(http.ResponseWriter, *http.Request)

func (a *BasicAuth) CheckAuth(r *http.Request) bool {
	s := strings.SplitN(r.Header.Get("Authorization"), " ", 2)
	if len(s) != 2 {
		return false
	}

	b, err := base64.StdEncoding.DecodeString(s[1])
	if err != nil {
		return false
	}

	pair := strings.SplitN(string(b), ":", 2)
	if len(pair) != 2 {
		return false
	}

	return pair[0] == a.username && pair[1] == a.password
}

func (a *BasicAuth) Wrap(wrapped BasicHandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if ok := a.CheckAuth(r); ok {
			wrapped(w, r)
		} else {
			logger.Println("auth failed!")
			w.Header().Set("WWW-Authenticate", `Basic realm="MY REALM"`)
			w.WriteHeader(401)
			w.Write([]byte("401 Unauthorized\n"))
		}
	}
}

func NewBasicAuth(username, password string) *BasicAuth {
	return &BasicAuth{username, password}
}
