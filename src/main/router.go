package main

import (
	"bytes"
	"encoding/json"
	"html/template"
	"net/http"
	"runtime/debug"
)

// 渲染首页模板
func homeHandler(w http.ResponseWriter, r *http.Request) {
	logger.Println("GET / homeHandler")
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
	//logger.Println("[vis] cmd:", Config.VisCommand)
	System(Config.VisCommand, &out)
	//logger.Println("[vis] response:", out.String())
	w.Header().Set("Content-Type", "application/json")
	w.Write(out.Bytes())
}

type Position struct {
	X int `json:"x"`
	Y int `json:"y"`
}
type Node struct {
	Name     string   `json:"name"`
	Position Position `json:"position"`
}

type VisPosition struct {
	Nodes []Node `json:"nodes"`
}

type Response struct {
	Status string `json:"status"`
}

func getDatabase(name string) *DB {
	db := NewDB(
		"ts",
		func() interface{} {
			var vis VisPosition
			return &vis
		})
	db.Init()
	return db
}

func topoPositionHandler(w http.ResponseWriter, r *http.Request) {
	defer func() {
		if err := recover(); err != nil {
			logger.Println(err)
			debug.PrintStack()
		}
	}()

	if r.Method == "POST" {
		logger.Println("POST /topo/position topoPositionHandler")
		var dt VisPosition
		decoder := json.NewDecoder(r.Body)
		err := decoder.Decode(&dt)
		if err != nil {
			logger.Println(err)
		}
		db := getDatabase("position")
		db.Update("position", dt)

		resp := Response{"ok"}
		buf, err := json.Marshal(resp)
		if err != nil {
			http.Error(w, "Marshal JSON failed", 500)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.Write(buf)
	} else {
		logger.Println("GET /topo/position topoPositionHandler")
		db := getDatabase("position")
		value := db.Get("position")

		logger.Println("value:", value)

		buf, err := json.Marshal(value)
		if err != nil {
			http.Error(w, "Marshal JSON failed", 500)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.Write(buf)
	}
}

func init() {
	auth := NewBasicAuth(Config.Username, Config.Password)

	http.Handle("/css/", http.FileServer(http.Dir("template")))
	http.Handle("/js/", http.FileServer(http.Dir("template")))

	http.HandleFunc("/", auth.Wrap(homeHandler))
	http.HandleFunc("/topo/vis", auth.Wrap(topoVisHandler))
	http.HandleFunc("/topo/position", auth.Wrap(topoPositionHandler))
}
