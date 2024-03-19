package db

import (
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"log"
	"time"
)

// Comment 对应数据库中的 comment 表
type Comment struct {
	ID          uint      `gorm:"primaryKey;autoIncrement"`
	WxID        string    `gorm:"not null;column:wx_id"`
	WxNickName  string    `gorm:"not null;column:wx_nick_name"`
	Number      int       `gorm:"not null;column:number"`
	NovelTitle  string    `gorm:"not null;column:novel_title"`
	CommentText string    `gorm:"column:comment"`
	CreateTime  time.Time `gorm:"not null;column:create_time"`
	UpdateTime  time.Time `gorm:"not null;column:update_time"`
}

var DB *gorm.DB

func InitDB() error {
	var err error
	DB, err = gorm.Open(sqlite.Open("wxbot.db"), &gorm.Config{Logger: logger.Default.LogMode(logger.Info)})
	if err != nil {
		return err
	}
	// 添加成功日志
	log.Println("Database connected and migrated successfully.")
	return nil
}

/*
*
插入评论信息
*/
func CreateComment(comment *Comment) {
	result := DB.Create(comment) // 使用result变量来接收返回的结果
	if result.Error != nil {     // 检查是否有错误发生
		log.Printf("Error creating comment: %v\n", result.Error) // 记录错误
	}
}
