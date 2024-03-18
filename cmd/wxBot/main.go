package main

// 文档：https://github.com/eatmoreapple/openwechat

import (
	"SamgeWxApi/cmd/db"
	_ "SamgeWxApi/cmd/db"
	config "SamgeWxApi/cmd/utils/u_config"
	"SamgeWxApi/cmd/wxBot/botHandler"
	"SamgeWxApi/cmd/wxBot/botMsg"
	"errors"
	"fmt"
	"log"
	_ "time"
)

// RunBot 运行wx机器人
func RunBot() {
	if err := config.InitCacheDir(); err != nil {
		panic(errors.New(fmt.Sprintf("InitCacheDir failed：%s", err.Error())))
	}

	bot := botHandler.CreatBot()
	botMsg.ParseMessage(bot)
	if !botHandler.ParseLogin(bot) {
		return
	}
	self, err := botHandler.ParseMine(bot)
	if err != nil {
		return
	}
	botHandler.ParseFriends(self)
	botHandler.ParseGroups(self)
	_ = bot.Block() // 阻塞主goroutine, 直到发生异常或者用户主动退出
}
func main() {
	//RunBot()
	err := db.InitDB()
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	db.CreateComment()

	readComment, err := db.GetCommentByID(1)
	if err != nil {
		log.Fatalf("Failed to get comment: %v", err)
	}
	fmt.Printf("Comment retrieved: %+v\n", readComment)

	err = db.UpdateCommentText(readComment.ID, "Updated comment text")
	if err != nil {
		log.Fatalf("Failed to update comment: %v", err)
	}

	//err = db.DeleteComment(readComment.ID)
	//if err != nil {
	//	log.Fatalf("Failed to delete comment: %v", err)
	//}
}
