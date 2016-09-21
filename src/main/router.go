package main

import (
	"html/template"
	"net/http"
)

func topoHandler(w http.ResponseWriter, r *http.Request) {
	logger.Println("topoHandler")
	t, err := template.ParseFiles("template/html/topo.html")
	if err != nil {
		logger.Println(err)
	}
	t.Execute(w, nil)
}

func init() {
	http.Handle("/css/", http.FileServer(http.Dir("template")))
	http.Handle("/js/", http.FileServer(http.Dir("template")))

	http.HandleFunc("/topo/", topoHandler)
}
