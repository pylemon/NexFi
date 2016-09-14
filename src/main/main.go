package main

import (
	"net/http"
	"log"
	"encoding/json"
	"strings"
	"reflect"
	"html/template"
)

func ajaxHandler(w http.ResponseWriter, r *http.Request) {
	pathInfo := strings.Trim(r.URL.Path, "/")
	parts := strings.Split(pathInfo, "/")
	var action = ""
	if len(parts) > 1 {
		action = strings.Title(parts[1]) + "Action"
	}

	ajax := &ajaxController{}
	controller := reflect.ValueOf(ajax)
	method := controller.MethodByName(action)
	if !method.IsValid() {
		method = controller.MethodByName(strings.Title("index") + "Action")
	}
	requestValue := reflect.ValueOf(r)
	responseValue := reflect.ValueOf(w)
	method.Call([]reflect.Value{responseValue, requestValue})
}


func NotFoundHandler(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path == "/" {
		http.Redirect(w, r, "/login", http.StatusFound)
	}

	t, err := template.ParseFiles("template/html/404.html")
	if (err != nil) {
		log.Println(err)
	}
	t.Execute(w, nil)
}

type loginController struct {
}

func (this *loginController)IndexAction(w http.ResponseWriter, r *http.Request) {
	t, err := template.ParseFiles("template/html/login/index.html")
	if (err != nil) {
		log.Println(err)
	}
	t.Execute(w, nil)
}

type Result struct {
	Ret    int
	Reason string
	Data   interface{}
}

type ajaxController struct {
}

func (this *ajaxController)LoginAction(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("content-type", "application/json")
	err := r.ParseForm()
	if err != nil {
		OutputJson(w, 0, "参数错误", nil)
		return
	}

	admin_name := r.FormValue("admin_name")
	admin_password := r.FormValue("admin_password")

	if admin_name == "" || admin_password == "" {
		OutputJson(w, 0, "参数错误", nil)
		return
	}

	admin_password_db := "123"

	if admin_password_db != admin_password {
		OutputJson(w, 0, "密码输入错误", nil)
		return
	}

	// 存入cookie,使用cookie存储
	cookie := http.Cookie{Name: "admin_name", Value: "123", Path: "/"}
	http.SetCookie(w, &cookie)

	OutputJson(w, 1, "操作成功", nil)
	return
}

func OutputJson(w http.ResponseWriter, ret int, reason string, i interface{}) {
	out := &Result{ret, reason, i}
	b, err := json.Marshal(out)
	if err != nil {
		return
	}
	w.Write(b)
}

func main() {
	log.Println("server started!")
	http.ListenAndServe(":8888", nil)
}
