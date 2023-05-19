# Cloud189Checkin
天翼网盘自动签到抽奖获取空间

## GitHub Action运行
### Fork此仓库
![](https://cdn.jsdelivr.net/gh/wes-lin/Cloud189Checkin/image/fork.png)
### 设置账号密码
新版本的git Action 需要创建environment来配合使用，创建一个名为user的环境。
![](https://cdn.jsdelivr.net/gh/wes-lin/Cloud189Checkin/image/env.png)
创建好后编辑user环境，添加两个变量TY_USER_NAME 是你的天翼网盘账号，TY_PASSWORD 是的你密码。现已支持多账户,最多可添加5个账户，第二个账户用户名变量是TY_USER_NAME1，密码变量是TY_PASSWORD1,以此类推，最多到TY_USER_NAME4,TY_PASSWORD4。
![](https://cdn.jsdelivr.net/gh/wes-lin/Cloud189Checkin/image/account.jpg)
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

执行命令
``` bash
npm start
```

## 更新内容

### 2023-05-15
[更新appConf获取方式](https://github.com/wes-lin/Cloud189Checkin/issues/5)
### 2023-05-19
[支持多账户](https://github.com/wes-lin/Cloud189Checkin/issues/7)