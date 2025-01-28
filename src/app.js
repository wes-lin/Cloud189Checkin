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

// 累计家庭签到容量和
let totalFamilyBonusToday = 0;
// 累计家庭签到次数
let totalSignCount = 0;

// 个人签到
const doTask = async (cloudClient) => {
  const result = [];
  const res1 = await cloudClient.userSign();
  result.push(
    `${res1.isSign ? "已经签到过了，" : ""}签到获得${res1.netdiskBonus}M空间`
  );
  return result;
};

// 家庭签到
const doFamilyTask = async (cloudClient) => {
  const { familyInfoResp } = await cloudClient.getFamilyList();
  const result = [];
  if (familyInfoResp) {
    for (let index = 0; index < familyInfoResp.length; index += 1) {
      const { familyId } = familyInfoResp[index];
      const res = await cloudClient.familyUserSign(108143869061636);
      if (res.signStatus !== undefined) {
        totalFamilyBonusToday += res.bonusSpace;
        totalSignCount += 1;
        result.push(
          "家庭任务" +
            `${res.signStatus ? "已经签到过了，" : ""}签到获得${
              res.bonusSpace
            }M空间`
        );
        logger.log(`当前累计容量：${totalFamilyBonusToday}M`);
        logger.log(`当前累计签到次数：${totalSignCount}`);
      }
    }
  }
  return result;
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
  for (let index = 0; index < accounts.length; index += 1) {
    const account = accounts[index];
    const { userName, password } = account;
    if (userName && password) {
      const userNameInfo = mask(userName, 3, 7);
      try {
        logger.log(`账户 ${userNameInfo}开始执行`);
        const cloudClient = new CloudClient(userName, password);
        await cloudClient.login();
        const result = await doTask(cloudClient);
        result.forEach((r) => logger.log(r));
        const familyResult = await doFamilyTask(cloudClient);
        familyResult.forEach((r) => logger.log(r));
        logger.log("任务执行完毕");
        const { cloudCapacityInfo, familyCapacityInfo } =
          await cloudClient.getUserSizeInfo();
        logger.log(
          `个人总容量：${(
            cloudCapacityInfo.totalSize /
            1024 /
            1024 /
            1024
          ).toFixed(2)}G,家庭总容量：${(
            familyCapacityInfo.totalSize /
            1024 /
            1024 /
            1024
          ).toFixed(2)}G`
        );
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
}

(async () => {
  try {
    await main();
  } finally {
    let content = recording.replay().map((e) => `${e.data.join("")}`).join("  \n");
    content += `\n\n今天家庭签到累计获得容量：${totalFamilyBonusToday}M`;
    content += `\n今天家庭签到次数：${totalSignCount}`;
    push("天翼云盘自动签到任务", content);
    recording.erase();
  }
})();
