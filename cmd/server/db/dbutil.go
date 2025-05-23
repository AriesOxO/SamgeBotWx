package db

import (
	config "SamgeWxApi/cmd/utils/u_config"
	"encoding/json"
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
	NovelType   int    `gorm:"not null;column:novel_type"` // 新增：文章类型 1-正文 2-彩蛋
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

// Novel 对应数据库中的 novels 表
type Novel struct {
	ID         uint   `gorm:"primaryKey;autoIncrement;column:id" json:"ID"`
	NovelTitle string `gorm:"not null;column:novel_title" json:"NovelTitle"`
	Number     int    `gorm:"not null;column:number" json:"Number"`
	Author     string `gorm:"not null;column:author" json:"Author"`
	Type       int    `gorm:"not null;column:type;default:1" json:"Type"` // 新增：文章类型 1-正文 2-彩蛋
	CreateTime string `gorm:"not null;column:create_time" json:"CreateTime"`
	UpdateTime string `gorm:"not null;column:update_time" json:"UpdateTime"`
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

// 以下是Novel表的CRUD操作

// CreateNovel 创建小说
func CreateNovel(novel *Novel) error {
	// 添加调试日志
	jsonData, _ := json.Marshal(novel)
	log.Printf("正在创建小说: %s", string(jsonData))

	result := DB.Create(novel)
	if result.Error != nil {
		log.Printf("创建小说失败: %v", result.Error)
		return result.Error
	}
	log.Printf("小说创建成功, ID: %d", novel.ID)
	return nil
}

// GetNovelByID 根据ID获取小说
func GetNovelByID(id uint) (*Novel, error) {
	novel := &Novel{}
	result := DB.First(novel, id)
	if result.Error != nil {
		return nil, result.Error
	}
	return novel, nil
}

// UpdateNovel 更新小说
func UpdateNovel(novel *Novel) error {
	result := DB.Save(novel)
	if result.Error != nil {
		return result.Error
	}
	return nil
}

// DeleteNovelByID 根据ID删除小说
func DeleteNovelByID(id uint) error {
	result := DB.Delete(&Novel{}, id)
	if result.Error != nil {
		return result.Error
	}
	return nil
}

// GetNovelsByNumber 根据届数获取小说
func GetNovelsByNumber(number int) ([]*Novel, error) {
	var novels []*Novel
	result := DB.Where("number = ?", number).Find(&novels)
	if result.Error != nil {
		return nil, result.Error
	}
	return novels, nil
}

// GetNovelByCondition 根据条件查询小说
func GetNovelByCondition(novelTitle string, number int, author string) (*Novel, error) {
	novel := &Novel{}
	result := DB.Where("novel_title = ? AND number = ? AND author = ?", novelTitle, number, author).First(novel)
	if result.Error != nil {
		return nil, result.Error
	}
	return novel, nil
}

// GetNovelByTitleAndNumber 根据小说标题和届数查询小说
func GetNovelByTitleAndNumber(novelTitle string, number int) (*Novel, error) {
	novel := &Novel{}
	result := DB.Where("novel_title = ? AND number = ?", novelTitle, number).First(novel)
	if result.Error != nil {
		return nil, result.Error
	}
	return novel, nil
}
