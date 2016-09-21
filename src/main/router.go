package main

import (
	"net/http"
)

func topoHandler(w http.ResponseWriter, r *http.Request) {
	logger.Println("topoHandler")
}


func init() {
	http.Handle("/css/", http.FileServer(http.Dir("template")))
	http.Handle("/js/", http.FileServer(http.Dir("template")))

	http.HandleFunc("/topo/", topoHandler)
}