package server

import (
	"SamgeWxApi/cmd/server/db"
	"database/sql"
	"fmt"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
	"strconv"
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

	r.Run(":8888") // listen and serve on 0.0.0.0:8080
}
