package botHandler

import (
	"SamgeWxApi/cmd/server/db"
	config "SamgeWxApi/cmd/utils/u_config"
	strutil "SamgeWxApi/cmd/utils/u_str"
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
	if ctx.IsRecalled() {
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
	if ctx.IsAt() {
		if strings.Contains(msgContent, "」\n- - - - - - - - - - - - - - -\n") {
			return
		}
		sender, err := ctx.SenderInGroup() // 获取群内发送者信息
		if err != nil {
			log.Println("Error getting group member:", err)
			return
		}
		// 使用正则表达式解析消息
		re := regexp.MustCompile(`(?s)@少爷\p{Z}+(.*?)\p{Z}+(.*?)\p{Z}+(.*)`)
		matches := re.FindStringSubmatch(msgContent)
		if len(matches) <= 2 {
			ctx.ReplyText("评论格式错误，请参考格式[@少爷 笔名 小说名字 评价内容(字数需大于50)]，@" + sender.NickName)
			return
		}
		if strutil.GetStrLength(matches[1]) < 1 && strutil.GetStrLength(matches[1]) > 10 {
			ctx.ReplyText("未识别到笔名，请参考格式请参考格式[@少爷 笔名 小说名字 评价内容(字数需大于50)]，@" + sender.NickName)
			return
		}
		if strutil.GetStrLength(matches[2]) < 1 {
			ctx.ReplyText("未识别到小说名字，请参考格式请参考格式[@少爷 笔名 小说名字 评价内容(字数需大于50)]，@" + sender.NickName)
			return
		}
		if strings.Contains(matches[2], "《") && strings.Contains(matches[2], "》") {
			ctx.ReplyText("格式错误，小说名字不能包含书名号@" + sender.NickName)
			return
		}
		if strutil.GetStrLength(matches[2]) > 45 {
			ctx.ReplyText("格式错误，小说名字过长，请检查格式是否错误，@" + sender.NickName)
			return
		}
		if strutil.GetStrLength(matches[3]) < 50 {
			ctx.ReplyText("评论内容过少，少爷我不收哦@" + sender.NickName)
			return
		}
		newComment := &db.Comment{
			MsgId:       ctx.Message.MsgId,
			WxNickName:  matches[1],
			Number:      config.LoadConfig().CompetitionNumber,
			NovelTitle:  "《" + matches[2] + "》",
			CommentText: matches[3],
			CreateTime:  time.Now().Format(time.DateTime),
			UpdateTime:  time.Now().Format(time.DateTime),
		}
		if !config.ValidTitle(matches[2]) {
			ctx.ReplyText("您的评论小说标题【"+matches[2]+"】写错了噢，请检查一下重新评论(⊙o⊙)？@" + sender.NickName)
			return
		}
		if comment, err := db.FindCommentByCondition(matches[1], config.LoadConfig().CompetitionNumber, "《"+matches[2]+"》"); err == nil && comment != nil {
			ctx.ReplyText("感谢评论，你已经评论过了，少爷我只收一次哦@" + sender.NickName)
		} else {
			if err := db.CreateComment(newComment); err == nil {
				ctx.ReplyText("感谢<" + matches[1] + ">评论小说《" + matches[2] + "》，已收录@" + sender.NickName)
				ctx.ReplyText("请注意核对[评论昵称]和[小说名称]，如果错误请撤回重新评论，辛苦啦OvO")
			} else {
				// 处理创建评论时的错误
				ctx.ReplyText("抱歉，少爷我没匹配到评论@" + sender.NickName)
			}
		}

	}
}
