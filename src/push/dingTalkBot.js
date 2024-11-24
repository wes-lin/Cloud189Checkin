const superagent = require("superagent");

module.exports = {
  accessToken: process.env.DINGTALK_ACCESS_TOKEN || "",

  async sendNotification(title, desp) {
    if (!this.accessToken) {
      console.warn("❌ 未配置钉钉 Access Token");
      return;
    }

    const url = `https://oapi.dingtalk.com/robot/send?access_token=${this.accessToken}`;
    const data = {
      msgtype: "text",
      text: {
        content: `${title}\n\n${desp}`,
      },
    };

    try {
      const res = await superagent.post(url).send(data);
      const json = JSON.parse(res.text);
      if (json.errcode !== 0) {
        console.error(`钉钉推送失败: ${JSON.stringify(json)}`);
      } else {
        console.info("钉钉推送成功");
      }
    } catch (err) {
      console.error(`钉钉推送失败: ${err.message}`);
    }
  },
};
