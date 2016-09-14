package main

import (
	"net/http"
	"log"
	"strings"
	"reflect"
)

func loginHandler(w http.ResponseWriter, r *http.Request) {
	log.Println("loginHandler")
	pathInfo := strings.Trim(r.URL.Path, "/")
	parts := strings.Split(pathInfo, "/")
	var action = ""
	if len(parts) > 1 {
		action = strings.Title(parts[1]) + "Action"
	}

	login := &loginController{}
	controller := reflect.ValueOf(login)
	method := controller.MethodByName(action)
	if !method.IsValid() {
		method = controller.MethodByName(strings.Title("index") + "Action")
	}
	requestValue := reflect.ValueOf(r)
	responseValue := reflect.ValueOf(w)
	method.Call([]reflect.Value{responseValue, requestValue})
}


func init() {
	http.Handle("/css/", http.FileServer(http.Dir("template")))
	http.Handle("/js/", http.FileServer(http.Dir("template")))

	//http.HandleFunc("/ajax/", ajaxHandler)
	http.HandleFunc("/login/", loginHandler)
	http.HandleFunc("/", NotFoundHandler)
}