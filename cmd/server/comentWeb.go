package server

import (
	"log"
	"net/http"
)

func StartWebServer() {
	// 设置静态文件服务
	fs := http.FileServer(http.Dir("./public"))
	http.Handle("/", fs)
	// 启动服务器
	log.Println("Starting web server on :8081")
	if err := http.ListenAndServe(":8081", nil); err != nil {
		log.Fatalf("Failed to start web server: %v", err)
	}
}
