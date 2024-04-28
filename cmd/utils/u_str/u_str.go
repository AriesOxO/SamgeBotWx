package u_str

import (
	"math"
	"regexp"
	"strconv"
	"strings"
	"unicode"
)

// Str2Int64 字符串转int64
func Str2Int64(v string) int64 {
	valInt, err := strconv.ParseInt(v, 10, 64)
	if err != nil {
		valInt = 0
	}
	return valInt
}

// FirstStr 获取首个不为空的字符串
func FirstStr(vLst ...interface{}) string {
	for _, v := range vLst {
		if &v != nil && len(v.(string)) > 0 {
			return v.(string)
		}
	}
	return ""
}

// TrimNewlineSpace 去除所有换行跟空格
func TrimNewlineSpace(s string) string {
	if len(s) == 0 {
		return ""
	}
	s = strings.ReplaceAll(s, "\n", "")
	s = strings.ReplaceAll(s, " ", "")
	return s
}

// Contains 判断某个值是否存在与一个由,分割的字符串里
func Contains(names, name string) bool {
	nameList := strings.Split(names, ",")
	for _, n := range nameList {
		if n == name {
			return true
		}
	}
	return false
}

// GetStrLength 返回输入的字符串的字数，汉字和中文标点算 1 个字数，英文和其他字符 2 个算 1 个字数，不足 1 个算 1个
func GetStrLength(str string) float64 {
	if len(str) == 0 {
		return 0
	}
	var total float64
	reg := regexp.MustCompile("/·|，|。|《|》|‘|’|”|“|；|：|【|】|？|（|）|、/")
	for _, r := range str {
		if unicode.Is(unicode.Scripts["Han"], r) || reg.Match([]byte(string(r))) {
			total = total + 1
		} else {
			total = total + 0.5
		}
	}

	return math.Ceil(total)
}
