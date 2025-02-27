# Cloud189Checkin

天翼网盘自动签到（随机容量），家庭空间签到（随机容量）。

# 重要说明！！！

请勿直接修改 .env，然后提交到 github，源码仓库是公开的，别人可以直接看到你的账号密码。因为错误使用本仓库导致账号密码泄漏，并且在使用这个脚本出现账户异常情况，本人概不负责！！！

## **目录**

- [环境变量](#环境变量)
- [推送环境变量](#推送环境变量)
- [GitHub Action 运行](#GitHubAction运行)
- [本地运行](#本地运行)
- [其他环境集成](#其他环境集成)
- [交流群](#交流群)
- [更新内容](#更新内容)

## 环境变量

<table>
  <tr>
    <th>名称</th>
    <th>类型</th>
    <th>例子</th>
    <th>说明</th>
  </tr>
  <tr>
    <td>TY_ACCOUNTS</td>
    <td>数组</td>
    <td><pre><code>[{"userName":"账号 1","password":"账号 1 的密码"},{"userName":"账号 2","password":"账号 2 的密码"}] </code></pre> </a></td>
    <td>天翼的账号,userName 和 password 为你的天翼账号和密码,如果你遇到你账号密码中有特殊字符如#$等无法解析的 <a href="https://github.com/wes-lin/Cloud189Checkin/issues/76">SyntaxError</a>, 请在你的配置中将 TY_ACCOUNTS 用单引号包起来,例如<pre><code>'[{"userName":"1234567890","password":"123334\#\$\#\$"}]'</code></pre></td>
  </tr>
  <tr>
    <td>EXEC_THRESHOLD</td>
    <td>数字</td>
    <td>10</td>
    <td>签到并发数,目前发现在同时发送签到请求可获取多次奖励,这 bug 在个人和家庭的签到任务同样有生效。但是这是具有一定风险性, 并且获取到奖励是不固定的,请谨慎使用。 默认是不开启, 默认签到执行一次,如设置建议并发数为 10,注意这个变量并不是越大越好</td>
  </tr>
  <tr>
    <td>TY_FAMILIES</td>
    <td>数组</td>
    <td><pre><code>["18xxxxx","17xxxx"]</code></pre></td>
    <td>目前电信的家庭签到可以将子账号的签到奖励叠加到主账号上,首先你需要把子账号都加入到你的主账号家庭组中,然后配置该变量。例如目前我的家庭组是 18xxxxx,目前有三个账号,那么这个三个账号签到奖励都会汇集到主账号上, 配置成["189xxxxx"],注意是你的家庭组的全名,我这里是一个例子,因为客户端会将你名称打星号处理了,所以你要点 app 上的编辑家庭名称,来获取完整名称然后填到该变量上.<img src="https://cdn.jsdelivr.net/gh/wes-lin/Cloud189Checkin/image/families.jpg"></td>
  </tr>
</table>

## 推送环境变量

<table>
  <tr>
    <th>渠道</th>
    <th>变量名</th>
    <th>说明</th>
  </tr>
  <tr>
    <td>Server 酱</td>
    <td>SENDKEY</td>
    <td>Server 酱的配置和 Sendkey 的获取可查看 <a href="https://sct.ftqq.com/">Server 酱官网</a></td>
  </tr>
  <tr>
    <td rowspan="2">TelegramBot</td>
    <td>TELEGRAM_BOT_TOKEN</td>
    <td><em>Telegram Bot Token</em> </td>
  </tr>
    <tr>
    <td>TELEGRAM_CHAT_ID</td>
    <td><em>Telegram 接收推送消息的会话 ID</em></td>
  </tr>
  <tr>
    <td rowspan="2">微信群机器人</a></td>
    <td>WECOM_BOT_KEY</td>
    <td><em>推送 AppToken</em> <a href="https://developer.work.weixin.qq.com/document/path/91770">配置说明</td>
  </tr>
  <tr>
    <td>WECOM_BOT_TELPHONE</td>
    <td><em>接收推送手机号</em></td>
  </tr>
  <tr>
    <td rowspan="2">WxPusher 
  
  </td>
    <td>WX_PUSHER_APP_TOKEN</td>
    <td><em>WxPuser 推送 AppToken</em>默认使用是我的 WxPusher,你也可以改成你自己 wxPusher 开发者账户,修改 WX_PUSHER_APP_TOKEN</td>
  </tr>
  <tr>
    <td>WX_PUSHER_UID</td>
    <td><em>接收推送 UID</em>如果想直接使用我的 wxPush 应用,请扫描这个二维码进行关联.<img src="https://wxpusher.zjiecode.com/api/qrcode/4Ix7noqD3L7DMBoSlvig3t4hqjFWzPkdHqAYsg8IzkPreW7d8uGUHi9LJO4EcyJg.jpg">然后拿到 UID 后,把 WX_PUSHER_UID 配成你拿到的 UID.<img src="https://cdn.jsdelivr.net/gh/wes-lin/Cloud189Checkin/image/wxpusher.jpg"></td>
  </tr>
</table>

## GitHub Action 运行

### Fork 此仓库

![](https://cdn.jsdelivr.net/gh/wes-lin/Cloud189Checkin/image/fork.png)

### 设置工作流权限

将 Settings -> Actions -> Workflow permissions 改成 Read and write permissions
![](https://github.com/user-attachments/assets/28d27a78-73f2-489e-aa7e-cac87c0fc509)

### 设置账号密码

新版本的 git Action 需要创建 environment 来配合使用，创建一个名为 user 的环境。
![](https://cdn.jsdelivr.net/gh/wes-lin/Cloud189Checkin/image/env.png)
创建好后编辑 user 环境，添加变量 TY_ACCOUNTS
![](https://cdn.jsdelivr.net/gh/wes-lin/Cloud189Checkin/image/accounts.jpg)

如果你遇到你账号密码中有特殊字符如#$等无法解析的[SyntaxError](https://github.com/wes-lin/Cloud189Checkin/issues/76),请在你的配置中将TY_ACCOUNTS用单引号包起来
例如'[{"userName":"1234567890","password":"123334#$#$"}]'

### 设置签到并发值

目前发现电信的签到, 在同时发送请求时, 能同时获取到奖励,这bug在个人和家庭的签到任务同样有生效. 但是这是具有一定风险性, 并且获取到奖励是不固定的,请谨慎使用.如果因为使用该脚本出现账号异常,本人概不负责. 设置环境变量 EXEC_THRESHOLD 默认是不开启, 默认签到执行一次,如设置建议并发数为5.
- `EXEC_THRESHOLD` 同时签到的最大进程数

### 设置家庭签到

目前电信的家庭签到可以将子账号的签到奖励叠加到主账号上,首先你需要把子账号都加入到你的主账号家庭组中,然后配置该环境变量.
- `TY_FAMILIES` 需要签到的主账号家庭名称,可以添加多个主账号如["18xxxxx","17xxxx"]
例如目前我的家庭组是18xxxxx,目前有三个账号,那么这个三个账号签到奖励都会汇集到主账号上, TY_FAMILIES 需要配置成["189xxxxx"],注意是你的家庭组的全名,我这里这是一个例子,因为客户端会将你名称打星号处理了,所以你要点app上的编辑家庭名称,来获取完整名称然后填到该变量上.
![](https://cdn.jsdelivr.net/gh/wes-lin/Cloud189Checkin/image/families.jpg)


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

#### pushPlus 推送

- `PUSH_PLUS_TOKEN ` _pushPlus 推送 token_
- 注册和获取 token：https://www.pushplus.plus/uc.html
- 拿到 token 后，把 PUSH_PLUS_TOKEN 配成你拿到的 token.
- 免费用户每天有 200 条推送额度

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

## 其他环境集成

我已经把天翼网盘的相关 API 集成到 [SDK](https://github.com/wes-lin/cloud189-sdk) 了，有编程能力的同学可以自行拓展，集成到自己的代码环境。

## 交流群

![](https://cdn.jsdelivr.net/gh/wes-lin/Cloud189Checkin/image/group.jpg)

## [更新内容](https://github.com/wes-lin/Cloud189Checkin/wiki/更新内容)
