package db

import (
	config "SamgeWxApi/cmd/utils/u_config"
	"fmt"
	"log"
	"time"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// Comment 对应数据库中的 comment 表
type Comment struct {
	ID          uint   `gorm:"primaryKey;autoIncrement"`
	MsgId       string `gorm:"not null;column:msg_id"`
	WxNickName  string `gorm:"not null;column:wx_nick_name"`
	Number      int    `gorm:"not null;column:number"`
	NovelTitle  string `gorm:"not null;column:novel_title"`
	CommentText string `gorm:"column:comment"`
	CreateTime  string `gorm:"not null;column:create_time"`
	UpdateTime  string `gorm:"not null;column:update_time"`
}

// Settings 对应数据库中的 settings 表
type Settings struct {
	ID    uint   `gorm:"primaryKey;autoIncrement"`
	Key   string `gorm:"not null;column:key;uniqueIndex"`
	Value string `gorm:"not null;column:value"`
	Desc  string `gorm:"column:desc"`
}

type CommentStatic struct {
	WxNickName string
	NovelTitle string
	Number     string
	Count      int
}

var DB *gorm.DB

func InitDB() error {
	var err error
	DB, err = gorm.Open(sqlite.Open(config.LoadConfig().SqliteUrl), &gorm.Config{Logger: logger.Default.LogMode(logger.Error)})
	if err != nil {
		return err
	}
	log.Println("数据库初始化成功")
	sqlDB, err := DB.DB()
	if err != nil {
		return fmt.Errorf("failed to get database instance: %w", err)
	}
	// 设置连接池参数
	sqlDB.SetMaxIdleConns(100)                // 设置空闲连接池中连接的最大数量
	sqlDB.SetMaxOpenConns(1000)               // 设置打开数据库连接的最大数量
	sqlDB.SetConnMaxLifetime(time.Hour)       // 设置连接可复用的最大时间
	sqlDB.SetConnMaxIdleTime(5 * time.Minute) // 设置连接在空闲状态下的最大存活时间

	// 添加成功日志
	log.Println("Database connected and migrated successfully.")
	return nil
}

// 以下是Settings表的CRUD操作

// GetSettingByKey 根据Key获取配置
func GetSettingByKey(key string) (*Settings, error) {
	setting := &Settings{}
	result := DB.Where("`key` = ?", key).First(setting)
	if result.Error != nil {
		return nil, result.Error
	}
	return setting, nil
}

// GetAllSettings 获取所有配置
func GetAllSettings() ([]Settings, error) {
	var settings []Settings
	result := DB.Find(&settings)
	if result.Error != nil {
		return nil, result.Error
	}
	return settings, nil
}

// CreateSetting 创建配置
func CreateSetting(setting *Settings) error {
	result := DB.Create(setting)
	if result.Error != nil {
		return result.Error
	}
	return nil
}

// UpdateSetting 更新配置
func UpdateSetting(key string, value string, desc string) error {
	// 使用map更新，因为struct会忽略零值
	result := DB.Model(&Settings{}).Where("`key` = ?", key).Updates(map[string]interface{}{
		"value": value,
		"desc":  desc,
	})
	if result.Error != nil {
		return result.Error
	}
	return nil
}

// DeleteSetting 删除配置
func DeleteSetting(key string) error {
	result := DB.Where("`key` = ?", key).Delete(&Settings{})
	if result.Error != nil {
		return result.Error
	}
	return nil
}

// CreateComment 创建评论
func CreateComment(comment *Comment) error {
	result := DB.Create(comment)
	if result.Error != nil {
		return result.Error
	}
	return nil
}

// GetCommentByID 根据ID获取评论
func GetCommentByID(id uint) (*Comment, error) {
	comment := &Comment{}
	result := DB.First(comment, id)
	if result.Error != nil {
		return nil, result.Error
	}
	return comment, nil
}

// UpdateComment 更新评论
func UpdateComment(comment *Comment) error {
	result := DB.Save(comment)
	if result.Error != nil {
		return result.Error
	}
	return nil
}

// DeleteCommentByID 根据ID删除评论
func DeleteCommentByID(id uint) error {
	result := DB.Delete(&Comment{}, id)
	if result.Error != nil {
		return result.Error
	}
	return nil
}

// GetCommentsByNumber 根据 number 获取所有评论
func GetCommentsByNumber(number int) ([]*Comment, error) {
	var comments []*Comment
	result := DB.Where("number = ?", number).Find(&comments)
	if result.Error != nil {
		return nil, result.Error
	}
	return comments, nil
}
func UpdateCommentByCondition(wxNickName string, number int, novelTitle, newCommentText string) error {
	result := DB.Model(&Comment{}).Where("wx_nick_name = ? AND number = ? AND novel_title = ?", wxNickName, number, novelTitle).Update("comment", newCommentText)
	if result.Error != nil {
		return result.Error
	}
	fmt.Printf("Updated %v record(s)\n", result.RowsAffected)
	return nil
}

func FindCommentByCondition(wxNickName string, number int, novelTitle string) (*Comment, error) {
	var comment Comment
	result := DB.Where("wx_nick_name = ? AND number = ? AND novel_title = ?", wxNickName, number, novelTitle).First(&comment)
	if result.Error != nil {
		return nil, result.Error
	}
	return &comment, nil
}

// 根据唯一的 WxID 删除评论数据
func DeleteCommentByWxID(msgId string) error {
	result := DB.Delete(&Comment{}, "msg_id = ?", msgId)
	if result.Error != nil {
		return result.Error
	}
	return nil
}

// 根据唯一的 WxID 查询评论数据
func GetCommentByWxID(msgId string) (*Comment, error) {
	comment := &Comment{}
	result := DB.Where("msg_id = ?", msgId).First(comment)
	if result.Error != nil {
		return nil, result.Error
	}
	return comment, nil
}

func FindUniqueComment(wxNickName string, number int, novelTitle string) (*Comment, error) {
	comment := &Comment{}
	result := DB.Where("wx_nick_name = ? AND number = ? AND novel_title = ?", wxNickName, number, novelTitle).First(comment)
	if result.Error != nil {
		return nil, result.Error
	}
	return comment, nil
}
