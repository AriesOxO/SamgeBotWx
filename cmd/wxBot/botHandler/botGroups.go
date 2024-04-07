package botHandler

import (
	"SamgeWxApi/cmd/server/db"
	config "SamgeWxApi/cmd/utils/u_config"
	"fmt"
	"github.com/eatmoreapple/openwechat"
	"log"
	"regexp"
	"strconv"
	"strings"
	"time"
)

// ParseGroups 处理群组相关事务
func ParseGroups(self *openwechat.Self) {
	groups, err := self.Groups()
	fmt.Println(groups, err)
}

/*
*
文学群处理逻辑
*/
func FeiBang(ctx *openwechat.MessageContext) {
	if ctx.IsTickledMe() {
		ctx.ReplyText("拍本少爷干嘛！去读书！去码字！去谈恋爱哇Q_Q")
	}
	msgContent := ctx.Content
	if strings.Contains(msgContent, "- - - - - - - - - - - - - - - ") {
		return
	}
	if ctx.IsAt() {
		if err := db.InitDB(); err != nil {
			log.Fatalf("Error initializing database: %v", err)
		}
		sender, err := ctx.SenderInGroup() // 获取群内发送者信息
		if err != nil {
			log.Println("Error getting group member:", err)
			return
		}
		// 使用正则表达式解析消息
		re := regexp.MustCompile(`@(.+?)\s*(《.+?》)\s*([\s\S]+)`)
		matches := re.FindStringSubmatch(msgContent)
		if len(matches) <= 2 {
			ctx.ReplyText("评论格式错误，请参考格式@少爷《小说名字》评论内容@" + sender.NickName)
			return
		}

		if len(matches[3]) < 30 {
			ctx.ReplyText("评论内容过少，本少爷不收@" + sender.NickName)
			return
		}
		if strings.Contains(matches[3], "- - - - - - - - - - - - - - - ") {
			return
		}
		newComment := &db.Comment{
			MsgId:       ctx.Message.MsgId,
			WxNickName:  sender.NickName,
			Number:      config.NumberOfRaces,
			NovelTitle:  matches[2],
			CommentText: matches[3],
			CreateTime:  time.Now().Format(time.DateTime),
			UpdateTime:  time.Now().Format(time.DateTime),
		}
		if comment, err := db.FindCommentByCondition(sender.NickName, config.NumberOfRaces, matches[2]); err == nil && comment != nil {
			ctx.ReplyText("感谢评论，你已经评论过了，少爷我只收一次哦@" + sender.NickName)
		} else {
			if err := db.CreateComment(newComment); err == nil {
				ctx.ReplyText("感谢评论，已收录@" + sender.NickName)
			} else {
				// 处理创建评论时的错误
				ctx.ReplyText("抱歉，少爷我没匹配到评论@" + sender.NickName)
			}
		}

	}
	if ctx.IsRecalled() {
		if err := db.InitDB(); err != nil {
			log.Fatalf("Error initializing database: %v", err)
		}
		msg := ctx.Message
		revokeMsg, _ := msg.RevokeMsg()    // 获取撤回消息对象
		msgId := revokeMsg.RevokeMsg.MsgId // 拿到撤回消息的id
		comment, err := db.GetCommentByWxID(strconv.FormatInt(msgId, 10))
		if err != nil {
			fmt.Println("获取评论时出错:", err)
			return
		}
		if comment != nil && len(comment.WxNickName) > 0 {
			ctx.ReplyText("评论消息撤回,收录评论已删除@" + comment.WxNickName + "请重新评论哦QvQ")
			db.DeleteCommentByWxID(strconv.FormatInt(msgId, 10))
		}
	}
}
