#!/bin/sh
# Kill services of port number

# 检查用户是否输入端口号
port=$1

if [[ $port == "" ]]
then 
	echo "Please input port number!"
	exit 8
fi




# 查看当前端口是否有服务占用
info=$(lsof -i:$port)

if [[ $info == "" ]]
then
	echo "Port number no service!"
	exit 8
fi

echo $info

# 显示第二行到最后一行($代表最后一行)并去重
allPid=$(echo `lsof -i:$port|awk '{print $2}'|sed -n '2,$p'|sort -u`)
echo "Service pid: " $allPid


# 显示所有行数,去除字符串中空格并将字符串转为int
lines=$(echo $allPid | wc -l | sed 's/[[:space:]]//g' | awk '{print int($0)}')


# 循环杀死服务下所有PID
isSuccess=0

for (( i=1; i <= $lines; i++ ))
do
	kill -9 $(echo $allPid | sed -n $i'p')
	# 判断上条命令执行是否成功
	if [[ $? == 0 ]]
	then
		let isSuccess+=1
	fi
done

if [[ $isSuccess > 0 ]]
then
	echo "kill "$port" port services done!"
else
	echo "kill "$port" port services fail!"
fi

