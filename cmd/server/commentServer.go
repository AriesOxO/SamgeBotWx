package server

import (
	"SamgeWxApi/cmd/server/db"
	config "SamgeWxApi/cmd/utils/u_config"
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func StartApiServer() {
	gin.SetMode(gin.ReleaseMode)
	r := gin.Default()
	// 添加CORS中间件
	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{"*"}, // 允许的域名}, // 允许的HTTP方法
	}))

	//根据条件查询所有评论
	r.GET("/api/comments", func(c *gin.Context) {
		var comments []db.Comment
		var totalCount int64

		// 解析页码和每页条目数量，默认为第一页，每页显示10条
		page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
		if err != nil || page < 1 {
			page = 1
		}
		pageSize, err := strconv.Atoi(c.DefaultQuery("pageSize", "20"))
		if err != nil || pageSize < 1 {
			pageSize = 20
		}
		offset := (page - 1) * pageSize

		query := db.DB
		if wxNickName := c.Query("wxNickName"); wxNickName != "" {
			query = query.Where("wx_nick_name LIKE ?", "%"+wxNickName+"%")
		}
		if novelTitle := c.Query("novelTitle"); novelTitle != "" {
			query = query.Where("novel_title LIKE ?", "%"+novelTitle+"%")
		}
		if number := c.Query("number"); number != "" {
			query = query.Where("number = ?", number)
		}
		if startTime := c.Query("startTime"); startTime != "" {
			query = query.Where("create_time >= ?", startTime)
		}
		if endTime := c.Query("endTime"); endTime != "" {
			query = query.Where("create_time <= ?", endTime)
		}

		query = query.Order("create_time desc").Find(&comments)
		// 获取总记录数
		query.Model(&db.Comment{}).Count(&totalCount)

		// 查询分页数据
		query.Offset(offset).Limit(pageSize).Find(&comments)

		// 构造响应数据，包括总记录数和分页数据
		responseData := map[string]interface{}{
			"total":    totalCount,
			"page":     page,
			"pageSize": pageSize,
			"data":     comments,
		}

		c.JSON(http.StatusOK, responseData)
	})

	//评论统计接口
	r.GET("/api/static", func(c *gin.Context) {
		groupType := c.Query("groupType")
		sortType := c.Query("sortType")
		wxNickName := c.Query("wxNickName")
		novelTitle := c.Query("novelTitle")
		number := c.Query("number")
		condition := "1=1"

		if wxNickName != "" {
			condition += " AND wx_nick_name LIKE '%" + wxNickName + "%'"
		}

		if novelTitle != "" {
			condition += " AND novel_title LIKE '%" + novelTitle + "%'"
		}

		if number != "" {
			condition += " AND number = '" + number + "'"
		}
		var result []db.CommentStatic
		if sortType == "" {
			sortType = "0" // 默认降序
		}
		var groutBy string
		switch groupType {
		case "1":
			groutBy = "wx_nick_name"
		case "2":
			groutBy = "novel_title"
		case "3":
			groutBy = "number"
		default:
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid groupType"})
			return
		}
		var sortOrder string
		if sortType == "1" {
			sortOrder = "ASC"
		} else {
			sortOrder = "DESC"
		}
		query := fmt.Sprintf("SELECT %s, COUNT(*) AS count FROM comments where  %s GROUP BY %s ORDER BY count %s", groutBy, condition, groutBy, sortOrder)
		rows, err := db.DB.Raw(query).Rows()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
			return
		}
		defer func(rows *sql.Rows) {
			err := rows.Close()
			if err != nil {

			}
		}(rows)
		for rows.Next() {
			var (
				grouptype string
				count     int
			)
			err := rows.Scan(&grouptype, &count)
			if err != nil {
				log.Println("Error scanning rows:", err)
				continue
			}
			result = append(result, db.CommentStatic{
				WxNickName: grouptype,
				NovelTitle: grouptype,
				Number:     grouptype,
				Count:      count,
			})
		}
		c.JSON(http.StatusOK, result)
	})
	// 检查评论是否重复
	r.POST("/api/checkcomment", func(c *gin.Context) {
		var comment db.Comment
		if err := c.ShouldBindJSON(&comment); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data"})
			return
		}

		var existingComment db.Comment
		result := db.DB.Where("wx_nick_name = ? AND number = ? AND novel_title = ?",
			comment.WxNickName, comment.Number, comment.NovelTitle).First(&existingComment)

		if result.Error == nil {
			c.JSON(http.StatusOK, gin.H{
				"exists":  true,
				"message": "评论已存在",
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"exists":  false,
			"message": "评论不存在",
		})
	})

	// 检查小说名称是否存在
	r.GET("/api/checknovel", func(c *gin.Context) {
		number := c.Query("number")
		novelTitle := c.Query("novelTitle")

		if number == "" || novelTitle == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Missing required parameters"})
			return
		}

		isValid := config.ValidTitle(novelTitle)
		if !isValid {
			c.JSON(http.StatusOK, gin.H{
				"exists":  false,
				"message": "小说名称不存在",
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"exists":  true,
			"message": "小说名称有效",
		})
	})

	// 增加评论接口
	r.GET("/api/getSeason", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "获取当前赛季成功",
			"data":    config.LoadConfig().CompetitionNumber,
		})
	})

	// 增加评论接口
	r.POST("/api/addcomments", func(c *gin.Context) {
		var newComment db.Comment
		if err := c.ShouldBindJSON(&newComment); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// 设置创建时间和修改时间
		now := time.Now()
		newComment.CreateTime = now.Format("2006-01-02 15:04:05")
		newComment.UpdateTime = now.Format("2006-01-02 15:04:05")
		//newComment.Number = config.LoadConfig().CompetitionNumber

		// 创建评论
		if err := db.DB.Create(&newComment).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create comment"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Comment created successfully",
			"data":    newComment,
		})
	})

	// 删除评论接口
	r.DELETE("/api/comments/:id", func(c *gin.Context) {
		id := c.Param("id")

		// 检查评论是否存在
		var comment db.Comment
		if err := db.DB.First(&comment, id).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "评论不存在",
			})
			return
		}

		// 删除评论
		if err := db.DB.Delete(&comment).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "删除评论失败",
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "评论删除成功",
		})
	})

	// 修改评论接口
	r.PUT("/api/comments/:id", func(c *gin.Context) {
		id := c.Param("id")

		// 检查评论是否存在
		var existingComment db.Comment
		if err := db.DB.First(&existingComment, id).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "评论不存在",
			})
			return
		}

		// 解析请求体中的新数据
		var updatedComment db.Comment
		if err := c.ShouldBindJSON(&updatedComment); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "无效的请求数据",
			})
			return
		}

		// 更新评论
		// 只更新内容字段，保留其他字段不变
		if err := db.DB.Model(&existingComment).Updates(map[string]interface{}{
			"comment":      updatedComment.CommentText,
			"wx_nick_name": updatedComment.WxNickName,
			// 可以根据需要添加其他允许修改的字段
		}).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "更新评论失败",
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "评论更新成功",
			"data":    existingComment,
		})
	})

	r.Run(":8888") // listen and serve on 0.0.0.0:8080
}
