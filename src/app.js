/* eslint-disable no-await-in-loop */
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
// process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'
const superagent = require("superagent");
const { CloudClient } = require("cloud189-sdk");
const serverChan = require("./push/serverChan");
const telegramBot = require("./push/telegramBot");
const wecomBot = require("./push/wecomBot");
const wxpush = require("./push/wxPusher");
const accounts = require("../accounts");

const mask = (s, start, end) => s.split("").fill("*", start, end).join("");

// 修改后的任务函数，只包含签到任务
const doTask = async (cloudClient) => {
  const result = [];
  const res1 = await cloudClient.userSign();
  result.push(
    `${res1.isSign ? "已经签到过了，" : ""}签到获得${res1.netdiskBonus}M空间`
  );
  return result;
};

const doFamilyTask = async (cloudClient) => {
  const { familyInfoResp } = await cloudClient.getFamilyList();
  const result = [];
  let totalFamilyBonusToday = 0; // 用于累加今天家庭签到获得的容量
  if (familyInfoResp) {
    for (let index = 0; index < familyInfoResp.length; index += 1) {
       const { familyId } = familyInfoResp[index];
      const res = await cloudClient.familyUserSign(108143869061636);
      result.push(
        "家庭任务" +
          `${res.signStatus ? "已经签到过了，" : ""}签到获得${
            res.bonusSpace
          }M空间`
      );
      // 累加今天家庭签到获得的容量
      totalFamilyBonusToday += res.bonusSpace;
    }
  }
  return { result, totalFamilyBonusToday };
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
    .post(`https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${wecomBot.key}`)
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

// 修改后的主函数，只执行签到任务
async function main() {
  let totalFamilyBonusToday = 0; // 用于累加所有账号今天家庭签到获得的容量
  let totalAccounts = 0; // 用于统计签到的账号总数
  let successfulAccounts = 0; // 用于统计成功签到的账号数
  let failedAccounts = 0; // 用于统计失败签到的账号数
  let lastAccountResult = ""; // 用于存储最后一个账号的签到内容

  for (let index = 0; index < accounts.length; index += 1) {
    const account = accounts[index];
    const { userName, password } = account;
    if (userName && password) {
      totalAccounts += 1; // 累加签到的账号总数
      const userNameInfo = mask(userName, 3, 7);
      try {
        logger.log(`账户 ${userNameInfo}开始执行`);
        const cloudClient = new CloudClient(userName, password);
        await cloudClient.login();
        const result = await doTask(cloudClient);
        const { result: familyResult, totalFamilyBonusToday: familyBonusToday } = await doFamilyTask(cloudClient);
        lastAccountResult = result.concat(familyResult).join("\n"); // 存储最后一个账号的签到内容
        successfulAccounts += 1; // 累加成功签到的账号数
        totalFamilyBonusToday += familyBonusToday; // 累加今天家庭签到获得的容量
      } catch (e) {
        logger.error(e);
        failedAccounts += 1; // 累加失败签到的账号数
      } finally {
        logger.log(`账户 ${userNameInfo}执行完毕`);
      }
    }
  }

  // 将总家庭签到获得的容量转换为MB并保留两位小数
  const totalFamilyBonusTodayMB = (totalFamilyBonusToday / 1024 / 1024).toFixed(2);
  const summary = `今天签到了 ${totalAccounts} 个账号，成功了 ${successfulAccounts} 个账号，失败了 ${failedAccounts} 个账号，今天家庭签到总共获得 ${totalFamilyBonusTodayMB}MB 空间`;
  logger.log(summary);
  return { lastAccountResult, summary };
}

(async () => {
  try {
    const { lastAccountResult, summary } = await main();
    const content = `${lastAccountResult}\n${summary}`;
    push("天翼云盘自动签到任务", content);
  } catch (error) {
    logger.error(`任务执行失败: ${error}`);
  }
})();
