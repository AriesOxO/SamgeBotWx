package server

import (
	"SamgeWxApi/cmd/server/db"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
)

func StartApiServer() {
	gin.SetMode(gin.ReleaseMode)
	r := gin.Default()
	r.GET("/api/comments", func(c *gin.Context) {
		if err := db.InitDB(); err != nil {
			log.Fatalf("Error initializing database: %v", err)
		}
		var comments []db.Comment
		query := db.DB.Debug()
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
		query.Find(&comments)
		c.JSON(http.StatusOK, comments)
	})
	r.Run(":8888") // listen and serve on 0.0.0.0:8080
}
