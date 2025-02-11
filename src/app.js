require("dotenv").config();
const log4js = require("log4js");
const recording = require("log4js/lib/appenders/recording");
log4js.configure({
  appenders: {
    vcr: {
      type: "recording",
    },
    out: {
      type: "console",
    },
  },
  categories: { default: { appenders: ["vcr", "out"], level: "info" } },
});

const logger = log4js.getLogger();
const superagent = require("superagent");
const { CloudClient } = require("cloud189-sdk");
const serverChan = require("./push/serverChan");
const telegramBot = require("./push/telegramBot");
const wecomBot = require("./push/wecomBot");
const wxpush = require("./push/wxPusher");
const accounts = require("../accounts");
const families = require("../families");
const execThreshold = process.env.EXEC_THRESHOLD || 1;

const mask = (s, start, end) => s.split("").fill("*", start, end).join("");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 个人签到
const doUserTask = async (cloudClient) => {
  const tasks = Array.from({ length: execThreshold }, () =>
    cloudClient.userSign()
  );
  const result = (await Promise.all(tasks)).map(
    (res) =>
      `个人任务${res.isSign ? "已经签到过了，" : ""}签到获得${
        res.netdiskBonus
      }M空间`
  );
  return result;
};

// 家庭签到
const doFamilyTask = async (cloudClient) => {
  const { familyInfoResp } = await cloudClient.getFamilyList();
  if (familyInfoResp) {
    let familyId = null;
    //指定家庭签到
    if (families.length > 0) {
      const tagetFamily = familyInfoResp.find((familyInfo) =>
        families.includes(familyInfo.remarkName)
      );
      if (tagetFamily) {
        familyId = tagetFamily.familyId;
      } else {
        return [
          `没有加入到指定家庭分组${families
            .map((family) => mask(family, 3, 7))
            .toString()}`,
        ];
      }
    } else {
      familyId = familyInfoResp[0].familyId;
    }
    logger.info(`执行家庭签到ID:${familyId}`);
    const tasks = Array.from({ length: execThreshold }, () =>
      cloudClient.familyUserSign(familyId)
    );
    const result = (await Promise.all(tasks)).map(
      (res) =>
        `家庭任务${res.signStatus ? "已经签到过了，" : ""}签到获得${
          res.bonusSpace
        }M空间`
    );
    return result;
  }
  return [];
};

const pushServerChan = (title, desp) => {
  if (!serverChan.sendKey) {
    return;
  }
  const data = {
    title,
    desp,
  };
  superagent
    .post(`https://sctapi.ftqq.com/${serverChan.sendKey}.send`)
    .type("form")
    .send(data)
    .end((err, res) => {
      if (err) {
        logger.error(`ServerChan推送失败:${JSON.stringify(err)}`);
        return;
      }
      const json = JSON.parse(res.text);
      if (json.code !== 0) {
        logger.error(`ServerChan推送失败:${JSON.stringify(json)}`);
      } else {
        logger.info("ServerChan推送成功");
      }
    });
};

const pushTelegramBot = (title, desp) => {
  if (!(telegramBot.botToken && telegramBot.chatId)) {
    return;
  }
  const data = {
    chat_id: telegramBot.chatId,
    text: `${title}\n\n${desp}`,
  };
  superagent
    .post(`https://api.telegram.org/bot${telegramBot.botToken}/sendMessage`)
    .type("form")
    .send(data)
    .end((err, res) => {
      if (err) {
        logger.error(`TelegramBot推送失败:${JSON.stringify(err)}`);
        return;
      }
      const json = JSON.parse(res.text);
      if (!json.ok) {
        logger.error(`TelegramBot推送失败:${JSON.stringify(json)}`);
      } else {
        logger.info("TelegramBot推送成功");
      }
    });
};

const pushWecomBot = (title, desp) => {
  if (!(wecomBot.key && wecomBot.telphone)) {
    return;
  }
  const data = {
    msgtype: "text",
    text: {
      content: `${title}\n\n${desp}`,
      mentioned_mobile_list: [wecomBot.telphone],
    },
  };
  superagent
    .post(
      `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${wecomBot.key}`
    )
    .send(data)
    .end((err, res) => {
      if (err) {
        logger.error(`wecomBot推送失败:${JSON.stringify(err)}`);
        return;
      }
      const json = JSON.parse(res.text);
      if (json.errcode) {
        logger.error(`wecomBot推送失败:${JSON.stringify(json)}`);
      } else {
        logger.info("wecomBot推送成功");
      }
    });
};

const pushWxPusher = (title, desp) => {
  if (!(wxpush.appToken && wxpush.uid)) {
    return;
  }
  const data = {
    appToken: wxpush.appToken,
    contentType: 1,
    summary: title,
    content: desp,
    uids: [wxpush.uid],
  };
  superagent
    .post("https://wxpusher.zjiecode.com/api/send/message")
    .send(data)
    .end((err, res) => {
      if (err) {
        logger.error(`wxPusher推送失败:${JSON.stringify(err)}`);
        return;
      }
      const json = JSON.parse(res.text);
      if (json.data[0].code !== 1000) {
        logger.error(`wxPusher推送失败:${JSON.stringify(json)}`);
      } else {
        logger.info("wxPusher推送成功");
      }
    });
};

const push = (title, desp) => {
  pushServerChan(title, desp);
  pushTelegramBot(title, desp);
  pushWecomBot(title, desp);
  pushWxPusher(title, desp);
};

// 开始执行程序
async function main() {
  // 用于统计实际容量变化
  const userSizeInfoMap = new Map();
  // 用于存储数据汇总部分的日志内容
  const summaryLogs = [];

  // 获取账号列表中最后一个账号的初始容量信息
  const lastAccount = accounts[accounts.length - 1];
  let lastAccountInitialCapacity = null;

  if (lastAccount) {
    const { userName, password } = lastAccount;
    if (userName && password) {
      const cloudClient = new CloudClient(userName, password);
      await cloudClient.login();
      const initialCapacity = await cloudClient.getUserSizeInfo();
      lastAccountInitialCapacity = {
        userName,
        cloudCapacityInfo: initialCapacity.cloudCapacityInfo.totalSize,
        familyCapacityInfo: initialCapacity.familyCapacityInfo.totalSize,
      };
    }
  }

  // 执行所有账号的签到任务
  for (let index = 0; index < accounts.length; index += 1) {
    const account = accounts[index];
    const { userName, password } = account;
    if (userName && password) {
      const userNameInfo = mask(userName, 3, 7);
      try {
        logger.log(`账户 ${userNameInfo}开始执行`);
        const cloudClient = new CloudClient(userName, password);
        await cloudClient.login();
        const beforeUserSizeInfo = await cloudClient.getUserSizeInfo();
        userSizeInfoMap.set(userName, {
          cloudClient,
          userSizeInfo: beforeUserSizeInfo,
        });
        const result = await doUserTask(cloudClient);
        result.forEach((r) => logger.log(r));
        const familyResult = await doFamilyTask(cloudClient);
        familyResult.forEach((r) => logger.log(r));
      } catch (e) {
        logger.error(e);
        if (e.code === "ETIMEDOUT") {
          throw e;
        }
      } finally {
        logger.log(`账户 ${userNameInfo}执行完毕`);
      }
    }
  }

  // 获取账号列表中最后一个账号的最终容量信息
  let lastAccountFinalCapacity = null;
  if (lastAccount) {
    const { userName, password } = lastAccount;
    if (userName && password) {
      const cloudClient = new CloudClient(userName, password);
      await cloudClient.login();
      const finalCapacity = await cloudClient.getUserSizeInfo();
      lastAccountFinalCapacity = {
        userName,
        cloudCapacityInfo: finalCapacity.cloudCapacityInfo.totalSize,
        familyCapacityInfo: finalCapacity.familyCapacityInfo.totalSize,
      };
    }
  }

  // 计算最后一个账号的容量变化并记录日志
  if (lastAccountInitialCapacity && lastAccountFinalCapacity) {
    const personalCapacityChange = (
      (lastAccountFinalCapacity.cloudCapacityInfo -
        lastAccountInitialCapacity.cloudCapacityInfo) /
      1024 /
      1024
    ).toFixed(2);
    const familyCapacityChange = (
      (lastAccountFinalCapacity.familyCapacityInfo -
        lastAccountInitialCapacity.familyCapacityInfo) /
      1024 /
      1024
    ).toFixed(2);

    const lastAccountLog = `
🔥主账号 ${mask(lastAccount.userName, 3, 7)} 容量变化：
个人增加：${personalCapacityChange} M, 家庭增加：${familyCapacityChange} M
个人总量：${(lastAccountFinalCapacity.cloudCapacityInfo / 1024 / 1024 / 1024).toFixed(2)} G, 家庭总量：${(lastAccountFinalCapacity.familyCapacityInfo / 1024 / 1024 / 1024).toFixed(2)} G
    `;
    // 将最后一个账号的容量变化日志添加到数组的最前面
    summaryLogs.unshift(lastAccountLog);
  }

  // 数据汇总
  for (const [userName, { cloudClient, userSizeInfo }] of userSizeInfoMap) {
    const userNameInfo = mask(userName, 3, 7);
    const afterUserSizeInfo = await cloudClient.getUserSizeInfo();
    const capacityChangePersonal = (
      (afterUserSizeInfo.cloudCapacityInfo.totalSize -
        userSizeInfo.cloudCapacityInfo.totalSize) /
      1024 /
      1024
    ).toFixed(2);
    const capacityChangeFamily = (
      (afterUserSizeInfo.familyCapacityInfo.totalSize -
        userSizeInfo.familyCapacityInfo.totalSize) /
      1024 /
      1024
    ).toFixed(2);

    // 获取签到后的个人总容量和家庭总容量
    const finalUserSizeInfo = await cloudClient.getUserSizeInfo();
    const finalPersonalCapacity = (
      finalUserSizeInfo.cloudCapacityInfo.totalSize / 1024 / 1024 / 1024
    ).toFixed(2);
    const finalFamilyCapacity = (
      finalUserSizeInfo.familyCapacityInfo.totalSize / 1024 / 1024 / 1024
    ).toFixed(2);

    // 构造数据汇总的日志内容
    const summaryLog = `🟢账户 ${userNameInfo} 今日签到：
个人增加：${capacityChangePersonal} M, 家庭增加：${capacityChangeFamily} M
个人总量：${finalPersonalCapacity} G, 家庭总量：${finalFamilyCapacity} G`;
    // 将日志内容添加到数组中
    summaryLogs.push(summaryLog);
  }

  // 返回数据汇总部分的日志内容和最后一个账号的最终容量信息
  return {
    summaryLogs: summaryLogs.join("\n"),
    lastAccountFinalCapacity,
  };
}

// 程序入口
(async () => {
  try {
    const { summaryLogs, lastAccountFinalCapacity } = await main();
    push("天翼云盘自动签到任务", summaryLogs);
    console.log("主账号容量信息：", lastAccountFinalCapacity);
  } catch (error) {
    logger.error(`主程序执行失败: ${error.message}`);
  } finally {
    recording.erase();
  }
})();
