## 玄武：[GitCourser/XuanWu](https://github.com/GitCourser/XuanWu)

### 和本地步骤一样，先看本地步骤：

1. 环境（node 18+）
2. 下载（克隆）项目
3. 安装依赖
4. 运行

### 教程开始

1. docker版自带 nodejs 可跳过安装环境，linux 和 windows 需自己下载安装

2. 下载项目
    - 从 `code` -> `download zip` 下载并解压
    - ![](https://cdn.jsdelivr.net/gh/wes-lin/Cloud189Checkin/doc/xuanwu/xw-01.png)
    - 看其中有3层 `Cloud189Checkin-main\src\push`，所以在 `文件管理` 建3层目录，主目录随便取比如 189，或者用默认的 Cloud189Checkin-main
    - ![](https://cdn.jsdelivr.net/gh/wes-lin/Cloud189Checkin/doc/xuanwu/xw-02.png)
    - 玄武可以批量上传文件，但不能传文件夹，所以3层目录要拖3次文件进来，看上面的路径，拖进来的文件就是传这个路径
    - ![](https://cdn.jsdelivr.net/gh/wes-lin/Cloud189Checkin/doc/xuanwu/xw-03.png)
    - 全部拖完以后就是这样，要是你nas或服务器有方便的文件管理功能也可以直接上传到docker挂载路径，就是xuanwu目录中
    - ![](https://cdn.jsdelivr.net/gh/wes-lin/Cloud189Checkin/doc/xuanwu/xw-04.png)
    - 修改 `.env` 配置文件，设置电信账号，并发数，消息接口之类的
    - ![](https://cdn.jsdelivr.net/gh/wes-lin/Cloud189Checkin/doc/xuanwu/xw-05.png)

3. 安装依赖
    - 这个我们用 `任务管理` 中 `自定义执行` 功能，本地说明让你cd进目录再用npm install，这里cd进的就是工作目录，填你刚才建的目录 189，命令照填，然后执行等待完成
    - ![](https://cdn.jsdelivr.net/gh/wes-lin/Cloud189Checkin/doc/xuanwu/xw-06.png)
    - 这个就是依赖安装完成了
    - ![](https://cdn.jsdelivr.net/gh/wes-lin/Cloud189Checkin/doc/xuanwu/xw-07.png)
    - 安装完成去 `文件管理` 里看会多 `node_modules` 这个目录
    - ![](https://cdn.jsdelivr.net/gh/wes-lin/Cloud189Checkin/doc/xuanwu/xw-08.png)

4. 运行
    - `任务管理` 中 `新建任务`，主要是命令和工作目录不能错，参考下图
    - ![](https://cdn.jsdelivr.net/gh/wes-lin/Cloud189Checkin/doc/xuanwu/xw-09.png)
    - 建好后这里可以测试运行
    - ![](https://cdn.jsdelivr.net/gh/wes-lin/Cloud189Checkin/doc/xuanwu/xw-10.png)
    - 运行结果，日志会等程序全部运行完出会显示出来，所以测试时可以先只用一个号
    - ![](https://cdn.jsdelivr.net/gh/wes-lin/Cloud189Checkin/doc/xw-11.png)

5. 分组运行
    - 想开多组的，用你nas或服务器的文件管理，或者直接在 `自定义执行` 用复制目录命令 `cr -r`，把原来的 189 目录复制一份，因为原目录中已经安装好了依赖，直接复制比你再从头来的方便
    - ![](https://cdn.jsdelivr.net/gh/wes-lin/Cloud189Checkin/doc/xuanwu/xw-12.png)
    - 复制完后去文件里看，多了一个 189-2，修改配置文件
    - ![](https://cdn.jsdelivr.net/gh/wes-lin/Cloud189Checkin/doc/xuanwu/xw-13.png)
    - 后面新建任务时就只有工作目录变成新的，其他不变
    - ![](https://cdn.jsdelivr.net/gh/wes-lin/Cloud189Checkin/doc/xuanwu/xw-14.png)


## 青龙：[whyour/qinglong](https://github.com/whyour/qinglong)

1. 命令方法
    - 青龙的用法大致和玄武一样，但青龙没有工作目录，所以每次执行的命令都要先进入项目目录，并用 `sh -c` 调用，命令为：  
      `sh -c "cd /ql/data/scripts/{目录} && npm ..."`

    - 用上面的例子安装依赖命令就是：  
      `sh -c "cd /ql/data/scripts/189 && npm install"`

    - 然后执行时将命令改为：  
      `sh -c "cd /ql/data/scripts/189 && npm start"`

2. [建脚本方法](https://www.yuque.com/w992/it/cloud189checkin)