# Cloud189Checkin

天翼网盘自动签到（随机容量) 和抽奖（三次，每次 50M，共 150M）获取空间，家庭空间签到（随机容量）。

# 重要说明！！！

请勿直接修改 .env，然后提交到 github，源码仓库是公开的，别人可以直接看到你的账号密码。因为错误使用本仓库导致账号密码泄漏，本人概不负责！！！

## **目录**

- [GitHub Action 运行](#GitHubAction运行)
- [本地运行](#本地运行)
- [其他环境集成](#其他环境集成)
- [更新内容](#更新内容)

## GitHub Action 运行

### Fork 此仓库

![](https://cdn.jsdelivr.net/gh/wes-lin/Cloud189Checkin/image/fork.png)

### 设置账号密码

新版本的 git Action 需要创建 environment 来配合使用，创建一个名为 user 的环境。
![](https://cdn.jsdelivr.net/gh/wes-lin/Cloud189Checkin/image/env.png)
创建好后编辑 user 环境，添加变量 TY_ACCOUNTS, userName 和 password 为你的天翼账号和密码,可以添加多个账号如[{"userName":"账号 1","password":"账号 1 的密码"},{"userName":"账号 2","password":"账号 2 的密码"}]
![](https://cdn.jsdelivr.net/gh/wes-lin/Cloud189Checkin/image/accounts.jpg)

### 设置推送

#### Server 酱

为了考虑到不同客户端兼容性,采用了 Server 酱,只需多配置下 SENDKEY
![](https://cdn.jsdelivr.net/gh/wes-lin/Cloud189Checkin/image/push.png)就行,Server 酱的配置和 sendkey 的获取可参看[Server 酱官网](https://sct.ftqq.com/)

#### TelegramBot 推送

- `TELEGRAM_BOT_TOKEN` _Telegram Bot Token_
- `TELEGRAM_CHAT_ID` _Telegram 接收推送消息的会话 ID_

#### 微信群机器人推送

- `WECOM_BOT_KEY ` _微信群机器人 webhook_
- `WECOM_BOT_TELPHONE ` _接收推送手机号_
  [群机器人配置说明](https://developer.work.weixin.qq.com/document/path/91770)

#### WxPusher 推送

- `WX_PUSHER_APP_TOKEN ` _WxPuser 推送 AppToken_
- `WX_PUSHER_UID ` _接收推送 UID_
  默认使用是我的 WxPusher,你也可以改成你自己 wxPusher 开发者账户,修改 WX_PUSHER_APP_TOKEN. 如果想直接使用我的 wxPush 应用,请扫描底下二维码进行关联.
  https://wxpusher.zjiecode.com/api/qrcode/4Ix7noqD3L7DMBoSlvig3t4hqjFWzPkdHqAYsg8IzkPreW7d8uGUHi9LJO4EcyJg.jpg
  然后拿到 UID 后,把 WX_PUSHER_UID 配成你拿到的 UID.
  ![](https://cdn.jsdelivr.net/gh/wes-lin/Cloud189Checkin/image/wxpusher.jpg)

### 执行任务

1. 点击**Action**，再点击**I understand my workflows, go ahead and enable them**
2. 给自己仓库点个 start 或者修改任意文件后提交一次或者手动点击运行
   ![](http://tu.yaohuo.me/imgs/2020/06/34ca160c972b9927.png)
3. 每天早上 10 点执行任务

### 查看运行结果

Actions > Cloud check in action > build
![](https://cdn.jsdelivr.net/gh/wes-lin/Cloud189Checkin/image/action.png)

## 本地运行

### 环境配置

```
Node.js 20+
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

​ 修改源码中.env 中 userName 和 password 为你的天翼账号和密码,可以添加多个账号如[{"userName":"账号 1","password":"账号 1 的密码"},{"userName":"账号 2","password":"账号 2 的密码"}]

```bash
TY_ACCOUNTS=[{"userName":"userName","password":"password"}]
```

### 推送

修改 serverChan.js 或者添加环境变量 SENDKEY

执行命令

```bash
npm start
```

## 其他环境集成

我已经天翼网盘的相关 API 集成到[SDK](https://github.com/wes-lin/cloud189-sdk)了，有编程能力的同学可以自行拓展，集成到自己的代码环境。

## [更新内容](https://github.com/wes-lin/Cloud189Checkin/wiki/更新内容)
