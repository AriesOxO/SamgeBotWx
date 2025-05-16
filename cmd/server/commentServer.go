package server

import (
	"SamgeWxApi/cmd/server/db"
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func StartApiServer() {
	gin.SetMode(gin.ReleaseMode)
	r := gin.Default()
	// 添加CORS中间件
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
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

	// 获取配置接口 - 获取所有配置
	r.GET("/api/settings", func(c *gin.Context) {
		settings, err := db.GetAllSettings()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "获取配置失败: " + err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "获取配置成功",
			"data":    settings,
		})
	})

	// 获取单个配置接口
	r.GET("/api/settings/:key", func(c *gin.Context) {
		key := c.Param("key")
		setting, err := db.GetSettingByKey(key)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "配置不存在",
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "获取配置成功",
			"data":    setting,
		})
	})

	// 添加配置接口
	r.POST("/api/settings", func(c *gin.Context) {
		var setting db.Settings
		if err := c.ShouldBindJSON(&setting); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "无效的请求数据: " + err.Error(),
			})
			return
		}

		// 检查key是否已存在
		_, err := db.GetSettingByKey(setting.Key)
		if err == nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "配置键已存在",
			})
			return
		}

		if err := db.CreateSetting(&setting); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "创建配置失败: " + err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "配置创建成功",
			"data":    setting,
		})
	})

	// 更新配置接口
	r.PUT("/api/settings/:key", func(c *gin.Context) {
		key := c.Param("key")

		// 检查配置是否存在
		_, err := db.GetSettingByKey(key)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "配置不存在",
			})
			return
		}

		var updateData struct {
			Value string `json:"value"`
			Desc  string `json:"desc"`
		}

		if err := c.ShouldBindJSON(&updateData); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "无效的请求数据: " + err.Error(),
			})
			return
		}

		if err := db.UpdateSetting(key, updateData.Value, updateData.Desc); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "更新配置失败: " + err.Error(),
			})
			return
		}

		// 获取更新后的配置
		updatedSetting, _ := db.GetSettingByKey(key)

		c.JSON(http.StatusOK, gin.H{
			"message": "配置更新成功",
			"data":    updatedSetting,
		})
	})

	// 删除配置接口
	r.DELETE("/api/settings/:key", func(c *gin.Context) {
		key := c.Param("key")

		// 检查配置是否存在
		_, err := db.GetSettingByKey(key)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "配置不存在",
			})
			return
		}

		if err := db.DeleteSetting(key); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "删除配置失败: " + err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "配置删除成功",
		})
	})

	// 为确保兼容性，保留以下接口
	r.GET("/api/getSeason", func(c *gin.Context) {
		setting, err := db.GetSettingByKey("competition_number")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "获取赛季失败",
			})
			return
		}

		// 转换为数字
		seasonNumber := setting.Value

		c.JSON(http.StatusOK, gin.H{
			"message": "获取当前赛季成功",
			"data":    seasonNumber,
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

		// 获取小说目录配置
		catalogueSetting, err := db.GetSettingByKey("novel_catalogue")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "获取小说目录失败",
			})
			return
		}

		// 验证小说标题
		isValid := strings.Contains(catalogueSetting.Value, novelTitle)
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

	//// 增加评论接口
	//r.GET("/api/getSeason", func(c *gin.Context) {
	//	c.JSON(http.StatusOK, gin.H{
	//		"message": "获取当前赛季成功",
	//		"data":    config.LoadConfig().CompetitionNumber,
	//	})
	//})

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
