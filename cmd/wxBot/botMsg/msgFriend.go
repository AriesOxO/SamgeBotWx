package botMsg

import (
	config "SamgeWxApi/cmd/utils/u_config"
	"SamgeWxApi/cmd/utils/u_str"
	"SamgeWxApi/cmd/wxBot/botUtil"
	"fmt"
	"github.com/eatmoreapple/openwechat"
	"strconv"
	"strings"
)

// 处理好友消息业务

// OnFriend 注册发送者为好友的处理函数
func OnFriend(dispatcher *openwechat.MessageMatchDispatcher) {
	dispatcher.OnFriend(func(ctx *openwechat.MessageContext) {
		msg := ctx.Message
		sender := botUtil.GetMsgSenderWithoutGroup(msg, "获取[OnFriend]消息发送者")
		if sender == nil {
			debugPrintMsg("OnFriend 注册发送者为好友的处理函数", "sender == nil")
			return
		}

		// 过滤公众号
		if sender.IsMP() {
			return
		}

		//debugPrintMsg("OnFriend 注册发送者为好友的处理函数", getSenderNameAndRawContent(ctx))

		name := sender.NickName
		friendIds := config.LoadConfig().FriendIds
		needParseMsg := friendIds == "" || u_str.Contains(friendIds, name)
		if needParseMsg {
			if ctx.Content == "开启" {
				config.BotEnable = 1
				ctx.ReplyText(fmt.Sprintf("匪帮评论收集机器人已开启: %d", config.BotEnable))
			}
			if ctx.Content == "关闭" {
				config.BotEnable = 0
				ctx.ReplyText(fmt.Sprintf("匪帮评论收集机器人已关闭: %d", config.BotEnable))
			}
			if strings.HasPrefix(ctx.Content, "设置当前赛季=") {
				parts := strings.Split(ctx.Content, "=")
				if len(parts) == 2 {
					season, err := strconv.Atoi(parts[1])
					if err == nil {
						config.NumberOfRaces = season
						ctx.ReplyText(fmt.Sprintf("当前赛季设置为：%d", config.NumberOfRaces))
						return
					}
				}
				ctx.ReplyText("无效的赛季设置格式")
			}
			//qType := fmt.Sprintf("[好友]%s|%s|%s|%s", name, sender.Self().ID(), sender.DisplayName, sender.RemarkName)
			//botUtil.CheckStartTagAndReply(msg, qType, sender)
		} else {
			debugPrintMsg("OnFriend 注册发送者为好友的处理函数", fmt.Sprintf("%s 不在 %s 名单内，跳过消息处理", name, friendIds))
		}
	})
}
