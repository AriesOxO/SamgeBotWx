package main

// 文档：https://github.com/eatmoreapple/openwechat

import (
	"SamgeWxApi/cmd/server"
	"SamgeWxApi/cmd/server/db"
	config "SamgeWxApi/cmd/utils/u_config"
	"errors"
	"fmt"
)

// RunBot 运行wx机器人
func RunBot() {
	if err := config.InitCacheDir(); err != nil {
		panic(errors.New(fmt.Sprintf("InitCacheDir failed：%s", err.Error())))
	}

	//bot := botHandler.CreatBot()
	//botMsg.ParseMessage(bot)
	//if !botHandler.ParseLogin(bot) {
	//	return
	//}
	//self, err := botHandler.ParseMine(bot)
	//if err != nil {
	//	return
	//}
	//botHandler.ParseFriends(self)
	//botHandler.ParseGroups(self)
	//_ = bot.Block() // 阻塞主goroutine, 直到发生异常或者用户主动退出
}
func main() {
	go db.InitDB()
	go RunBot()
	go server.StartApiServer()
	go server.StartWebServer()
	select {}
}
