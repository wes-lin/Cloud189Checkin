const { log4js } = require("../logger");
const superagent = require("superagent");
const serverChan = require("./serverChan");
const telegramBot = require("./telegramBot");
const wecomBot = require("./wecomBot");
const wxpush = require("./wxPusher");
const pushPlus = require("./pushPlus");
const bark = require("./bark");
const showDoc = require("./showDoc");

const logger = log4js.getLogger("push");
logger.addContext("user", "push");

const pushServerChan = (title, desp) => {
  if (!serverChan.sendKey) {
    return;
  }
  const data = {
    title,
    desp: desp.replaceAll("\n","\n\n"),
  };
  superagent
    .post(`https://sctapi.ftqq.com/${serverChan.sendKey}.send`)
    .type("form")
    .send(data)
    .then((res) => {
      logger.info("ServerChan推送成功");
    })
    .catch((err) => {
      if (err.response?.text) {
        const { info } = JSON.parse(err.response.text);
        logger.error(`ServerChan推送失败:${info}`);
      } else {
        logger.error(`ServerChan推送失败:${JSON.stringify(err)}`);
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
    .then((res) => {
      if (res.body?.ok) {
        logger.info("TelegramBot推送成功");
      } else {
        logger.error(`TelegramBot推送失败:${JSON.stringify(res.body)}`);
      }
    })
    .catch((err) => {
      logger.error(`TelegramBot推送失败:${JSON.stringify(err)}`);
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
    .then((res) => {
      if (res.body?.errcode) {
        logger.error(`wecomBot推送失败:${JSON.stringify(res.body)}`);
      } else {
        logger.info("wecomBot推送成功");
      }
    })
    .catch((err) => {
      logger.error(`wecomBot推送失败:${JSON.stringify(err)}`);
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
    .then((res) => {
      if (res.body?.code === 1000) {
        logger.info("wxPusher推送成功");
      } else {
        logger.error(`wxPusher推送失败:${JSON.stringify(res.body)}`);
      }
    })
    .catch((err) => {
      logger.error(`wxPusher推送失败:${JSON.stringify(err)}`);
    });
};

const pushPlusPusher = (title, desp) => {
  // 如果没有配置 pushPlus 的 token，则不执行推送
  if (!pushPlus.token) {
    return;
  }
  // 请求体
  const data = {
    token: pushPlus.token,
    title: title,
    content: desp,
  };
  // 发送请求
  superagent
    .post("http://www.pushplus.plus/send/")
    .send(data)
    .then((res) => {
      if (res.body?.code === 200) {
        logger.info("pushPlus 推送成功");
      } else {
        logger.error(`pushPlus 推送失败:${JSON.stringify(res.body)}`);
      }
    })
    .catch((err) => {
      logger.error(`pushPlus 推送失败:${JSON.stringify(err)}`);
    });
};

const pushBark = (title, desp) => {
  if (!bark.apiServer || !bark.sendKey) {
    return;
  }
  const encodedUrl = `${bark.apiServer}/${bark.sendKey}/${encodeURIComponent(title)}/${encodeURIComponent(desp)}`;
  superagent
    .get(encodedUrl)
    .then((response) => {
      // 请求成功
      logger.info("Bark推送成功");
    })
    .catch((error) => {
      // 请求失败
      logger.error(`Bark推送失败: ${JSON.stringify(error)}`);
    });
};

const pushShowDoc = (title, desp) => {
  if (!showDoc.sendKey) {
    return;
  }
  const encodedUrl = encodeURI(`https://push.showdoc.com.cn/server/api/push/${showDoc.sendKey}`);
  const data = {
    title: title,
    content: desp,
  };
  superagent
    .get(encodedUrl)
    .send(data)
    .then((response) => {
      // 请求成功
      logger.info("ShowDoc推送成功");
    })
    .catch((error) => {
      // 请求失败
      logger.error(`ShowDoc推送失败: ${JSON.stringify(error)}`);
    });
};

const push = (title, desp) => {
  pushServerChan(title, desp);
  pushTelegramBot(title, desp);
  pushWecomBot(title, desp);
  pushWxPusher(title, desp);
  pushPlusPusher(title, desp);
  pushBark(title, desp);
  pushShowDoc(title, desp);
};

module.exports = push;
