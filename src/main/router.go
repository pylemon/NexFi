package main

import (
	"bytes"
	"encoding/json"
	"html/template"
	"net/http"
	"runtime/debug"
)

func topoHandler(w http.ResponseWriter, r *http.Request) {
	logger.Println("GET /topo/ topoHandler")
	t, err := template.ParseFiles("template/html/topo.html")
	if err != nil {
		logger.Println(err)
	}
	t.Execute(w, nil)
}

// 获取拓扑结构的JSON数据
func topoVisHandler(w http.ResponseWriter, r *http.Request) {
	logger.Println("GET /topo/vis topoVisHandler")
	defer func() {
		if err := recover(); err != nil {
			logger.Println(err)
			debug.PrintStack()
		}
	}()

	var out bytes.Buffer
	System("ls", &out)
	w.Header().Set("Content-Type", "application/json")
	w.Write(out.Bytes())
}

// 一个ajax请求的例子
type BaseResponse struct {
	Result int    `json:"result"`
	Data   string `json:"data"`
}

func exampleAjaxHandler(w http.ResponseWriter, r *http.Request) {
	defer func() {
		if err := recover(); err != nil {
			logger.Println(err)
			debug.PrintStack()
		}
	}()

	var baseResp BaseResponse
	buf, err := json.Marshal(baseResp)
	if err != nil {
		http.Error(w, "Marshal JSON failed", 500)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(buf)

}

func init() {
	http.Handle("/css/", http.FileServer(http.Dir("template")))
	http.Handle("/js/", http.FileServer(http.Dir("template")))

	http.HandleFunc("/topo/", topoHandler)
	http.HandleFunc("/topo/vis", topoVisHandler)
	http.HandleFunc("/example", exampleAjaxHandler)
}
