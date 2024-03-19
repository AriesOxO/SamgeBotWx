package db

import (
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"log"
)

// Comment 对应数据库中的 comment 表
type Comment struct {
	ID          uint   `gorm:"primaryKey;autoIncrement"`
	WxID        string `gorm:"not null;column:wx_id"`
	WxNickName  string `gorm:"not null;column:wx_nick_name"`
	Number      int    `gorm:"not null;column:number"`
	NovelTitle  string `gorm:"not null;column:novel_title"`
	CommentText string `gorm:"column:comment"`
	CreateTime  string `gorm:"not null;column:create_time"`
	UpdateTime  string `gorm:"not null;column:update_time"`
}

var DB *gorm.DB

func InitDB() error {
	var err error
	DB, err = gorm.Open(sqlite.Open("wxbot.db"), &gorm.Config{Logger: logger.Default.LogMode(logger.Error)})
	if err != nil {
		return err
	}
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

/**
// 初始化数据库
	if err := db.InitDB(); err != nil {
		log.Fatalf("Error initializing database: %v", err)
	}

	// 创建新评论
	newComment := &db.Comment{
		WxID:        "wx1233",
		WxNickName:  "user1323",
		Number:      1,
		NovelTitle:  "Novel31",
		CommentText: "Great no3vel!",
		CreateTime:  time.Now().Format(time.DateTime),
		UpdateTime:  time.Now().Format(time.DateTime),
	}
	if err := db.CreateComment(newComment); err != nil {
		log.Fatalf("Error creating comment: %v", err)
	}

	// 根据ID获取评论
	retrievedComment, err := db.GetCommentByID(newComment.ID)
	if err != nil {
		log.Fatalf("Error getting comment by ID: %v", err)
	}
	log.Printf("Retrieved comment: %+v", retrievedComment)

	// 更新评论
	retrievedComment.CommentText = "Updated comment!"
	if err := db.UpdateComment(retrievedComment); err != nil {
		log.Fatalf("Error updating comment: %v", err)
	}

	//// 删除评论
	//if err := db.DeleteCommentByID(retrievedComment.ID); err != nil {
	//	log.Fatalf("Error deleting comment by ID: %v", err)
	//}
	log.Println("Comment deleted successfully")
*/
