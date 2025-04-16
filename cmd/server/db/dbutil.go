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

type CommentStatic struct {
	WxNickName string
	NovelTitle string
	Number     string
	Count      int
}

// Config 配置表结构体
type Config struct {
	ID      uint   `gorm:"primaryKey;autoIncrement" json:"id"`
	Key     string `gorm:"unique;not null;column:key" json:"key"`
	Value   string `gorm:"not null;column:value" json:"value"`
	Comment string `gorm:"column:comment" json:"comment"`
}

// Novel 小说表结构体
type Novel struct {
	ID         uint   `gorm:"primaryKey;autoIncrement" json:"id"`
	NickName   string `gorm:"not null;column:NickName" json:"NickName"`
	Number     int    `gorm:"not null;column:Number" json:"Number"`
	NovelTitle string `gorm:"not null;column:NovelTitle;default:''" json:"NovelTitle"`
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

// Config表批量增删改查
func CreateConfigs(configs []Config) error {
	return DB.Create(&configs).Error
}
func GetConfigs() ([]Config, error) {
	var configs []Config
	err := DB.Find(&configs).Error
	return configs, err
}
func UpdateConfigs(configs []Config) error {
	for _, cfg := range configs {
		if err := DB.Model(&Config{}).Where("id = ?", cfg.ID).Updates(cfg).Error; err != nil {
			return err
		}
	}
	return nil
}
func DeleteConfigs(ids []uint) error {
	return DB.Delete(&Config{}, ids).Error
}

// Novel表批量增删改查
func CreateNovels(novels []Novel) error {
	return DB.Create(&novels).Error
}
func GetNovels() ([]Novel, error) {
	var novels []Novel
	err := DB.Find(&novels).Error
	return novels, err
}
func UpdateNovels(novels []Novel) error {
	for _, n := range novels {
		if err := DB.Model(&Novel{}).Where("id = ?", n.ID).Updates(n).Error; err != nil {
			return err
		}
	}
	return nil
}
func DeleteNovels(ids []uint) error {
	return DB.Delete(&Novel{}, ids).Error
}

// Comment表分页与总数
func GetCommentsPaged(offset, limit int, filters map[string]interface{}) ([]Comment, int64, error) {
	var comments []Comment
	var total int64
	query := DB.Model(&Comment{})
	for k, v := range filters {
		query = query.Where(k, v)
	}
	err := query.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}
	err = query.Offset(offset).Limit(limit).Order("create_time desc").Find(&comments).Error
	if err != nil {
		return nil, 0, err
	}
	return comments, total, nil
}
