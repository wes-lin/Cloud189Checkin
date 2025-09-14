# Cloud189Checkin

天翼网盘自动签到（随机容量），~~家庭空间签到（随机容量）~~。

# 重要说明！！！

请勿直接修改 .env，然后提交到 github，源码仓库是公开的，别人可以直接看到你的账号密码。因为错误使用本仓库导致账号密码泄漏，并且在使用这个脚本出现账户异常情况，本人概不负责！！！
如果遇到设备ID不存在，需要二次设备校验，请先参考[这个](https://github.com/wes-lin/Cloud189Checkin/issues/165)关闭自己的设备锁。


# **目录**

- [GitHub Action 运行](#GitHubAction运行)
- [本地运行](#本地运行)
- [设置推送](#设置推送)
- [玄武-青龙面板](#玄武-青龙面板)
- [其他环境集成](#其他环境集成)
- [交流群](#交流群)
- [更新内容](#更新内容)

## GitHub Action 运行

### Fork 此仓库

![](https://cdn.jsdelivr.net/gh/wes-lin/Cloud189Checkin/image/fork.png)

### 设置工作流权限

将 Settings -> Actions -> Workflow permissions 改成 Read and write permissions
![](https://github.com/user-attachments/assets/28d27a78-73f2-489e-aa7e-cac87c0fc509)

### 设置账号密码

新版本的 git Action 需要创建 environment 来配合使用，创建一个名为 user 的环境
![](https://cdn.jsdelivr.net/gh/wes-lin/Cloud189Checkin/image/env.png)
创建好后编辑 user 环境，添加变量 TY_ACCOUNTS userName 和 password 为你的天翼账号和密码,可以添加多个账号如[{"userName":"账号 1","password":"账号 1 的密码"},{"userName":"账号 2","password":"账号 2 的密码"}]
![](https://cdn.jsdelivr.net/gh/wes-lin/Cloud189Checkin/image/accounts.jpg)

如果你遇到你账号密码中有特殊字符如#$等无法解析的[SyntaxError](https://github.com/wes-lin/Cloud189Checkin/issues/76),请在你的配置中将TY_ACCOUNTS用单引号包起来
例如'[{"userName":"1234567890","password":"123334#$#$"}]'

### 设置签到并发值

目前发现电信的签到, 在同时发送请求时, 能同时获取到奖励,这 bug 在个人和~~家庭~~的签到任务同样有生效. 但是这是具有一定风险性, 并且获取到奖励是不固定的,请谨慎使用.如果因为使用该脚本出现账号异常,本人概不负责. 设置环境变量 EXEC_THRESHOLD 默认是不开启, 默认签到执行一次,如设置建议并发数为 5.

- `EXEC_THRESHOLD` 同时签到的最大进程数

## 设置推送

### Server 酱

为了考虑到不同客户端兼容性,采用了 Server 酱,只需多配置下 SENDKEY
![](https://cdn.jsdelivr.net/gh/wes-lin/Cloud189Checkin/image/push.png)就行,Server 酱的配置和 sendkey 的获取可参看[Server 酱官网](https://sct.ftqq.com/)

### TelegramBot 推送

- `TELEGRAM_BOT_TOKEN` _Telegram Bot Token_
- `TELEGRAM_CHAT_ID` _Telegram 接收推送消息的会话 ID_

### 微信群机器人推送

- `WECOM_BOT_KEY ` _微信群机器人 webhook_
- `WECOM_BOT_TELPHONE ` _接收推送手机号_
  [群机器人配置说明](https://developer.work.weixin.qq.com/document/path/91770)

### WxPusher 推送

- `WX_PUSHER_APP_TOKEN ` _WxPuser 推送 AppToken_
- `WX_PUSHER_UID ` _接收推送 UID_
  默认使用是我的 WxPusher,你也可以改成你自己 wxPusher 开发者账户,修改 WX_PUSHER_APP_TOKEN. 如果想直接使用我的 wxPush 应用,请扫描底下二维码进行关联.
  https://wxpusher.zjiecode.com/api/qrcode/4Ix7noqD3L7DMBoSlvig3t4hqjFWzPkdHqAYsg8IzkPreW7d8uGUHi9LJO4EcyJg.jpg
  然后拿到 UID 后,把 WX_PUSHER_UID 配成你拿到的 UID.
  ![](https://cdn.jsdelivr.net/gh/wes-lin/Cloud189Checkin/image/wxpusher.jpg)

### PushPlus 推送

- `PUSH_PLUS_TOKEN ` _pushPlus 推送 token_
- 注册和获取 token：https://www.pushplus.plus/uc.html
- 拿到 token 后，把 PUSH_PLUS_TOKEN 配成你拿到的 token.
- 免费用户每天有 200 条推送额度

### ShowDoc 推送

- `SHOWDOC_KEY ` _ShowDoc 推送 key_
- ShowDoc 官网：https://push.showdoc.com.cn
- 打开官网，关注公众号，拿到 key 后，把 SHOWDOC_KEY 配成你拿到的 key
- 使用简单、开箱可用、长期维护、持续免费、编程可玩、不限制消息数量、不限制请求数

### Bark 推送 (仅支持 iPhone、iPad、M 芯片 Mac)

- `BARK_KEY ` _Bark 推送 key_
- Bark 官网：https://bark.day.app/
- 安装 Bark app，开启通知权限，拿到 key 后，把 BARK_KEY 配成你拿到的 key
- `可选` 支持自定义 server, 配置成 BARK_SERVER ，默认为官方通道 https://api.day.app
- 免费、开源、轻量；使用苹果 APNS 服务，及时、稳定、可靠；不会消耗设备的电量，基于系统推送服务与推送扩展，app 本体并不需要运行；隐私安全，可以通过一些方式确保包含作者本人在内的所有人都无法窃取你的隐私

### 执行任务

1. 点击**Action**，再点击**I understand my workflows, go ahead and enable them**
2. 给自己仓库点个 start 或者修改任意文件后提交一次或者手动点击运行
   ![](http://tu.yaohuo.me/imgs/2020/06/34ca160c972b9927.png)
3. 每天早上 10:35 点执行任务

### 查看运行结果

Actions > Cloud check in action > build
![](https://cdn.jsdelivr.net/gh/wes-lin/Cloud189Checkin/image/action.png)

## 本地运行

### 环境配置

```

Node.js 18+

```

### 克隆项目

```bash
git clone https://github.com/wes-lin/Cloud189Checkin.git
```

```bash
cd Cloud189Checkin
```

### 安装依赖

```bash
npm install
```

### 运行

修改源码中.env 中环境变量

执行命令

```bash
npm start
```

## 玄武-青龙面板

### [教程](doc/xuanwu)

## 其他环境集成

我已经把天翼网盘的相关 API 集成到 [SDK](https://github.com/wes-lin/cloud189-sdk) 了，有编程能力的同学可以自行拓展，集成到自己的代码环境。

## 交流群

![](https://cdn.jsdelivr.net/gh/wes-lin/Cloud189Checkin/image/group.jpg)

## [更新内容](https://github.com/wes-lin/Cloud189Checkin/wiki/更新内容)
