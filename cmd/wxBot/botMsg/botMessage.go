package botMsg

import (
	"SamgeWxApi/cmd/server/db"
	"SamgeWxApi/cmd/wxBot/botUtil"
	"fmt"
	"github.com/eatmoreapple/openwechat"
	"log"
	"regexp"
	"strconv"
	"time"
)

// ParseMessage 注册消息处理函数
func ParseMessage(bot *openwechat.Bot) {
	dispatcher := openwechat.NewMessageMatchDispatcher()
	regDispatcher(dispatcher)
	bot.MessageHandler = dispatcher.AsMessageHandler()
}

// regDispatcher 注册消息调度
func regDispatcher(dispatcher *openwechat.MessageMatchDispatcher) {
	// 按对象类型区分处理：如 添加好友、群组、好友、自己、公众号、指定名称的群组/好友、自定义条件的用户
	//OnFriendAdd(dispatcher)
	//OnFriend(dispatcher)
	//OnGroup(dispatcher)
	//OnUser(dispatcher)
	//OnFriendByNickName(dispatcher, "")
	//OnFriendByRemarkName(dispatcher, "")
	OnGroupByGroupName(dispatcher, "匪帮")
	//OnUserMp(dispatcher) // 自定义监听公众号类型消息

	// 按消息类型区分处理。目前不采用这种方式，因为不同类型可以用工具类对msg统一区分处理
	//OnText(dispatcher)
	//OnImage(dispatcher)
	//OnVoice(dispatcher)
	//OnCard(dispatcher)
	//OnMedia(dispatcher)
}

// OnText 注册处理消息类型为Text的处理函数
func OnText(dispatcher *openwechat.MessageMatchDispatcher) {
	dispatcher.OnText(func(ctx *openwechat.MessageContext) {
		debugPrintMsg("OnText 注册处理消息类型为Text的处理函数", getSenderNameAndRawContent(ctx))
	})
}

// OnImage 注册处理消息类型为Image的处理函数
func OnImage(dispatcher *openwechat.MessageMatchDispatcher) {
	dispatcher.OnImage(func(ctx *openwechat.MessageContext) {
		debugPrintMsg("OnImage 注册处理消息类型为Image的处理函数", getSenderNameAndRawContent(ctx))
	})
}

// OnEmoticon 注册处理消息类型为Emoticon的处理函数(表情包)
func OnEmoticon(dispatcher *openwechat.MessageMatchDispatcher) {
	dispatcher.OnImage(func(ctx *openwechat.MessageContext) {
		debugPrintMsg("OnEmoticon 注册处理消息类型为Emoticon的处理函数(表情包)", getSenderNameAndRawContent(ctx))
	})
}

// OnVoice 注册处理消息类型为Voice的处理函数
func OnVoice(dispatcher *openwechat.MessageMatchDispatcher) {
	dispatcher.OnVoice(func(ctx *openwechat.MessageContext) {
		debugPrintMsg("OnVoice 注册处理消息类型为Voice的处理函数", getSenderNameAndRawContent(ctx))
	})
}

// OnFriendAdd 注册处理消息类型为FriendAdd的处理函数
func OnFriendAdd(dispatcher *openwechat.MessageMatchDispatcher) {
	dispatcher.OnFriendAdd(func(ctx *openwechat.MessageContext) {
		debugPrintMsg("OnFriendAdd 注册处理消息类型为FriendAdd的处理函数", getSenderNameAndRawContent(ctx))
		msg := ctx.Message
		friend, err := msg.Agree("已同意好友")
		if err != nil {
			botUtil.SaveErrorLog(err, "同意好友请求")
		}
		fmt.Println(friend)
	})
}

// OnCard 注册处理消息类型为Card的处理函数
func OnCard(dispatcher *openwechat.MessageMatchDispatcher) {
	dispatcher.OnCard(func(ctx *openwechat.MessageContext) {
		debugPrintMsg("OnCard 注册处理消息类型为Card的处理函数", getSenderNameAndRawContent(ctx))
	})
}

// OnMedia 注册处理消息类型为Media(多媒体消息，包括但不限于APP分享、文件分享)的处理函数
func OnMedia(dispatcher *openwechat.MessageMatchDispatcher) {
	dispatcher.OnMedia(func(ctx *openwechat.MessageContext) {
		debugPrintMsg("OnMedia 注册处理消息类型为Media(多媒体消息，包括但不限于APP分享、文件分享)的处理函数", getSenderNameAndRawContent(ctx))
	})
}

// OnUser 注册根据消息发送者的行为是否匹配的消息处理函数
func OnUser(dispatcher *openwechat.MessageMatchDispatcher) {
	dispatcher.OnUser(checkUser, func(ctx *openwechat.MessageContext) {
		debugPrintMsg("OnUser 注册根据消息发送者的行为是否匹配的消息处理函数", getSenderNameAndRawContent(ctx))
	})
}

// OnFriendByRemarkName 注册根据好友备注是否匹配的消息处理函数
func OnFriendByRemarkName(dispatcher *openwechat.MessageMatchDispatcher, remarkName string) {
	dispatcher.OnFriendByRemarkName(remarkName, func(ctx *openwechat.MessageContext) {
		debugPrintMsg("OnFriendByRemarkName 注册根据好友备注是否匹配的消息处理函数", fmt.Sprintf("%s | %s", remarkName, getSenderNameAndRawContent(ctx)))
	})
}

// OnGroupByGroupName 注册根据群名是否匹配的消息处理函数
func OnGroupByGroupName(dispatcher *openwechat.MessageMatchDispatcher, groupName string) {
	dispatcher.OnGroupByGroupName(groupName, func(ctx *openwechat.MessageContext) { // 确保是群文本消息
		if ctx.IsTickledMe() {
			ctx.ReplyText("拍本少爷干嘛！去读书！去码字！去谈恋爱哇Q_Q")
		}
		msgContent := ctx.Content
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
			re := regexp.MustCompile(`@(.+?)\s*(《.+?》)\s*(.+)`)
			matches := re.FindStringSubmatch(msgContent)
			if len(matches) <= 2 {
				ctx.ReplyText("评论格式错误，请参考格式@少爷《小说名字》评论内容@" + sender.NickName)
				return
			}

			if len(matches[3]) < 30 {
				ctx.ReplyText("评论内容过少，本少爷不收@" + sender.NickName)
				return
			}
			newComment := &db.Comment{
				MsgId:       ctx.Message.MsgId,
				WxNickName:  sender.NickName,
				Number:      -1,
				NovelTitle:  matches[2],
				CommentText: matches[3],
				CreateTime:  time.Now().Format(time.DateTime),
				UpdateTime:  time.Now().Format(time.DateTime),
			}
			db.CreateComment(newComment)
			ctx.ReplyText("感谢评论,已收录@" + sender.NickName)
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
				ctx.ReplyText("评论消息测回,收录评论已删除@" + comment.WxNickName + "请重新评论哦QvQ")
				db.DeleteCommentByWxID(strconv.FormatInt(msgId, 10))
			}
		}
		//debugPrintMsg("OnGroupByGroupName 注册根据群名是否匹配的消息处理函数", fmt.Sprintf("%s | %s", groupName, getSenderNameAndRawContent(ctx)))
	})
}

// OnFriendByNickName 注册根据好友昵称是否匹配的消息处理函数
func OnFriendByNickName(dispatcher *openwechat.MessageMatchDispatcher, nickName string) {
	dispatcher.OnFriendByNickName(nickName, func(ctx *openwechat.MessageContext) {
		debugPrintMsg("OnFriendByNickName 注册根据好友昵称是否匹配的消息处理函数", fmt.Sprintf("%s | %s", nickName, getSenderNameAndRawContent(ctx)))
	})
}

// getSenderNameAndRawContent 获取发送者名称+原始消息内容 - 这个目前主要输出日志用
func getSenderNameAndRawContent(ctx *openwechat.MessageContext) string {
	return fmt.Sprintf("%s | %s", botUtil.GetMsgSenderNickNameInGroup(ctx.Message), ctx.RawContent)
}

// checkUser 检查用户是否符合要求
func checkUser(user *openwechat.User) bool {
	return true
}

// debugPrintMsg 调试时打印处理函数名+接收的原始信息
func debugPrintMsg(funcName string, content string) {
	fmt.Printf("[%s] => %s\n", funcName, content)
}
