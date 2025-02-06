 const { CloudClient } = require("cloud189-sdk");

// 敏感信息掩码工具
const mask = (s, start = 3, end = 7) => s.split("").fill("*", start, end).join("");

// 容量汇总变量
let totalPersonalGB = 0;
let totalFamilyGB = 0;
const capacityDetails = []; // 存储明细数据
const message = [];         // 消息通知内容

// 构建抽奖结果
const buildTaskResult = (res, result) => {
  const index = result.length + 1;
  result.push(
    res.errorCode === "User_Not_Chance" 
      ? `第${index}次抽奖失败，次数不足` 
      : `第${index}次抽奖成功，获得 ${res.prizeName}`
  );
};

// 延迟函数
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 核心任务逻辑
const doTask = async (cloudClient) => {
  const result = [];
  
  // 个人签到
  const res1 = await cloudClient.userSign();
  result.push(`${res1.isSign ? "已签到" : "签到成功"}，获得 ${res1.netdiskBonus}M 空间`);
  
  // 四次抽奖任务 (间隔5秒)
  await delay(5000);
  buildTaskResult(await cloudClient.taskSign(), result);
  
  await delay(5000);
  buildTaskResult(await cloudClient.taskPhoto(), result);
  
  await delay(5000);
  buildTaskResult(await cloudClient.taskKJ(), result);

  return result;
};

// 家庭空间任务
const doFamilyTask = async (cloudClient) => {
  const result = [];
  const { familyInfoResp } = await cloudClient.getFamilyList();
  
  if (familyInfoResp?.length) {
    for (const { familyId } of familyInfoResp) {
      try {
        const familyIdStr = String(familyId || "165515815004439"); // 确保是字符串
        const res = await cloudClient.familyUserSign(familyIdStr);
        result.push(
          `家庭空间${familyIdStr.slice(-4)}：${res.signStatus ? "已签到" : "签到成功"}，获得 ${res.bonusSpace}M 空间`
        );
      } catch (err) {
        console.error(`处理 familyId ${familyId} 时出错：`, err.message);
        result.push(`⚠️ 家庭空间 ${familyId} 签到失败：${err.message}`);
      }
    }
  } else {
    result.push("未找到家庭空间信息");
  }
  return result;
};

// 主执行函数
async function main(userName, password) {
  const userNameInfo = mask(userName);
  try {
    message.push(`\n🔔 账号 ${userNameInfo} 开始执行`);
    const cloudClient = new CloudClient(userName, password);
    
    // 登录验证
    if (!await cloudClient.login()) {
      message.push(`❌ 账号 ${userNameInfo} 登录失败`);
      return;
    }

    // 执行任务
    const [taskResult, familyResult] = await Promise.all([
      doTask(cloudClient),
      doFamilyTask(cloudClient)
    ]);
    
    // 记录任务结果
    message.push(...taskResult, ...familyResult);

    // 获取容量信息
    const { cloudCapacityInfo, familyCapacityInfo } = await cloudClient.getUserSizeInfo();
    const personalGB = (cloudCapacityInfo?.totalSize || 0) / 1024**3;
    const familyGB = (familyCapacityInfo?.totalSize || 0) / 1024**3;

    // 累计总容量
    totalPersonalGB += personalGB;
    totalFamilyGB += familyGB;
    capacityDetails.push({ userNameInfo, personalGB, familyGB });

    // 记录容量信息
    message.push(
      `📦 当前容量：个人 ${personalGB.toFixed(2)}G | 家庭 ${familyGB.toFixed(2)}G`
    );

  } catch (e) {
    message.push(`⚠️ 账号 ${userNameInfo} 执行异常：${e.message}`);
  } finally {
    message.push(`✅ 账号 ${userNameInfo} 执行完毕`);
  }
}

// 程序入口
(async () => {
  try {
    // 从环境变量读取账号 (格式：username|password)
    const c189s = process.env.CLOUD_189?.split('\n') || [];
    
    if (!c189s.length) {
      message.push("❌ 未配置环境变量 CLOUD_189");
      return;
    }

    // 遍历执行所有账号
    for (const account of c189s) {
      const [username, password] = account.split('|');
      if (username?.trim() && password?.trim()) {
        await main(username.trim(), password.trim());
        await delay(5000); // 账号间间隔
      }
    }

    // 生成汇总报告
    if (capacityDetails.length) {
      message.push("\n📊 ===== 容量汇总 =====");
      capacityDetails.forEach(({ userNameInfo, personalGB, familyGB }) => {
        message.push(
          `${userNameInfo.padEnd(10)}：个人 ${personalGB.toFixed(2).padStart(8)}G | 家庭 ${familyGB.toFixed(2).padStart(8)}G`
        );
      });
      message.push(
        "🔻".padEnd(25, "─"), 
        `总计：个人 ${totalPersonalGB.toFixed(2)}G | 家庭 ${totalFamilyGB.toFixed(2)}G`
      );
    }

  } catch (e) {
    message.push(`⚠️ 全局异常：${e.message}`);
  } finally {
    // 发送通知并输出日志
    console.log(message.join('\n'));
    await QLAPI?.notify?.('天翼云盘签到', message.join('\n'));
  }
})();@Noting is impossible. 
