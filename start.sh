#!/bin/bash

# 修改权限
set CGO_ENABLED=1
chmod +x main

# 后台运行并输出日志到log.out
nohup ./main &> log.out < /dev/null &
