# Cloud189Checkin
天翼网盘自动签到（随机容量) 和抽奖（三次，每次50M，共150M）获取空间  
## **目录**
- [GitHub Action运行](#GitHubAction运行)
- [本地运行](#本地运行)
- [更新内容](#更新内容)

## GitHub Action运行
### Fork此仓库
![](https://cdn.jsdelivr.net/gh/wes-lin/Cloud189Checkin/image/fork.png)
### 设置账号密码
新版本的git Action 需要创建environment来配合使用，创建一个名为user的环境。
![](https://cdn.jsdelivr.net/gh/wes-lin/Cloud189Checkin/image/env.png)
创建好后编辑user环境，添加两个变量TY_USER_NAME 是你的天翼网盘账号，TY_PASSWORD 是的你密码。现已支持多账户,最多可添加5个账户，第二个账户用户名变量是TY_USER_NAME1，密码变量是TY_PASSWORD1,以此类推，最多到TY_USER_NAME4,TY_PASSWORD4。
![](https://cdn.jsdelivr.net/gh/wes-lin/Cloud189Checkin/image/account.jpg)
### 设置推送
#### Server酱
为了考虑到不同客户端兼容性,采用了Server酱,只需多配置下SENDKEY
![](https://cdn.jsdelivr.net/gh/wes-lin/Cloud189Checkin/image/push.png)就行,Server酱的配置和sendkey的获取可参看[Server酱官网](https://sct.ftqq.com/)
#### TelegramBot推送
- `TELEGRAM_BOT_TOKEN` *Telegram Bot Token*
- `TELEGRAM_CHAT_ID` *Telegram 接收推送消息的会话 ID*
#### 微信群机器人推送
- `WECOM_BOT_KEY ` *微信群机器人webhook*
- `WECOM_BOT_TELPHONE ` *接收推送手机号*
[群机器人配置说明](https://developer.work.weixin.qq.com/document/path/91770)
#### WxPusher推送
- `WX_PUSHER_APP_TOKEN ` *WxPuser推送AppToken*
- `WX_PUSHER_UID ` *接收推送UID*
默认使用是我的WxPusher,你也可以改成你自己wxPusher开发者账户,修改WX_PUSHER_APP_TOKEN. 如果想直接使用我的wxPush应用,请扫描底下二维码进行关联.
https://wxpusher.zjiecode.com/api/qrcode/4Ix7noqD3L7DMBoSlvig3t4hqjFWzPkdHqAYsg8IzkPreW7d8uGUHi9LJO4EcyJg.jpg
然后拿到UID后,把WX_PUSHER_UID配成你拿到的UID.
![](https://cdn.jsdelivr.net/gh/wes-lin/Cloud189Checkin/image/wxpusher.jpg)
### 执行任务
1. 点击**Action**，再点击**I understand my workflows, go ahead and enable them**  
2. 给自己仓库点个start或者修改任意文件后提交一次  
![](http://tu.yaohuo.me/imgs/2020/06/34ca160c972b9927.png)
3. 每天早上10点执行任务

### 查看运行结果
Actions > Cloud check in action > build
![](https://cdn.jsdelivr.net/gh/wes-lin/Cloud189Checkin/image/action.png)

## 本地运行
### 环境配置 
```
Node.js 14+
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
​修改源码中accounts.js 中userName和password为你的天翼账号和密码，不想改动源码，也可以直接把账号密码写到你电脑的环境变量TY_USER_NAME和TY_PASSWORD
``` javascript
module.exports = [{
  userName: process.env.TY_USER_NAME || 'userName',
  password: process.env.TY_PASSWORD || 'password',
}, {
  userName: process.env.TY_USER_NAME1,
  password: process.env.TY_PASSWORD1,
}, {
  userName: process.env.TY_USER_NAME2,
  password: process.env.TY_PASSWORD2,
}, {
  userName: process.env.TY_USER_NAME3,
  password: process.env.TY_PASSWORD3,
}, {
  userName: process.env.TY_USER_NAME4,
  password: process.env.TY_PASSWORD4,
}];
```
![](https://cdn.jsdelivr.net/gh/wes-lin/Cloud189Checkin/image/local.png)

### 推送
修改serverChan.js 或者添加环境变量SENDKEY

执行命令
``` bash
npm start
```

## [更新内容](https://github.com/wes-lin/Cloud189Checkin/wiki/更新内容)
