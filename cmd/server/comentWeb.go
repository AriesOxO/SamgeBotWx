package server

import (
	"log"
	"net/http"
)

func StartWebServer() {
	// 设置静态文件服务
	fs := http.FileServer(http.Dir("./cmd/public"))
	http.Handle("/", fs)
	// 启动服务器
	log.Println("Starting web server on :8887")
	if err := http.ListenAndServe(":8887", nil); err != nil {
		log.Fatalf("Failed to start web server: %v", err)
	}
}
