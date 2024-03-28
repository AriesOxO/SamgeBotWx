package server

import (
	config "SamgeWxApi/cmd/utils/u_config"
	"embed"
	"io/fs"
	"log"
	"net/http"
)

//go:embed web/*
var WebFlies embed.FS

func StartWebServer() {
	// 设置静态文件服务
	web, _ := fs.Sub(WebFlies, "web")
	fs := http.FileServer(http.FS(web))
	http.Handle("/", http.StripPrefix("/", fs))
	// 启动服务器
	log.Println("Starting web server on :8887")
	if err := http.ListenAndServe(config.LoadConfig().WebPort, nil); err != nil {
		log.Fatalf("Failed to start web server: %v", err)
	}
}
