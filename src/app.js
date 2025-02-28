require("dotenv").config();
const fs = require("fs");
const { Cookie, CookieJar } = require("tough-cookie");
const { CloudClient } = require("cloud189-sdk");
const recording = require("log4js/lib/appenders/recording");
const accounts = require("../accounts");
const families = require("../families");
const {
  mask,
  formatDateISO,
  getIpAddr,
  deleteNonTargetDirectories,
  delay,
  groupByNum,
} = require("./utils");
const push = require("./push");
const { log4js, cleanLog, catLogs } = require("./logger");
const execThreshold = process.env.EXEC_THRESHOLD || 1;
//缓存cookie
const cacheCookie = !process.env.GITHUB_ACTIONS && process.env.CACHE_COOKIE === "true";

// 个人任务签到
const doUserTask = async (cloudClient, logger) => {
  const tasks = Array.from({ length: execThreshold }, () =>
    cloudClient.userSign()
  );
  const result = (await Promise.all(tasks)).filter((res) => !res.isSign);
  logger.info(
    `个人签到任务: 成功数/总请求数 ${result.length}/${tasks.length} 获得 ${
      result.map((res) => res.netdiskBonus)?.join(",") || "0"
    }M 空间`
  );
};

// 家庭任务签到
const doFamilyTask = async (cloudClient, logger) => {
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
        logger.error(
          `没有加入到指定家庭分组${families
            .map((family) => mask(family, 3, 7))
            .toString()}`
        );
      }
    } else {
      familyId = familyInfoResp[0].familyId;
    }
    logger.info(`执行家庭签到ID:${familyId}`);
    const tasks = Array.from({ length: execThreshold }, () =>
      cloudClient.familyUserSign(familyId)
    );
    const result = (await Promise.all(tasks)).filter((res) => !res.signStatus);
    return logger.info(
      `家庭签到任务: 成功数/总请求数 ${result.length}/${tasks.length} 获得 ${
        result.map((res) => res.bonusSpace)?.join(",") || "0"
      }M 空间`
    );
  }
};

const cookieDir = `.cookie/${formatDateISO(new Date())}`;

const saveCookies = async (userName, cookieJar) => {
  const ipIpAddr = await getIpAddr();
  if (!ipIpAddr) {
    return;
  }
  deleteNonTargetDirectories(".cookie", formatDateISO(new Date()));
  const cookiePath = `${cookieDir}/${ipIpAddr}`;
  if (!fs.existsSync(cookiePath)) {
    fs.mkdirSync(cookiePath, { recursive: true });
  }
  const cookies = cookieJar
    .getCookiesSync("https://cloud.189.cn")
    .map((cookie) => cookie.toString());
  fs.writeFileSync(`${cookiePath}/${userName}.json`, JSON.stringify(cookies), {
    encoding: "utf-8",
  });
};

const loadCookies = async (userName) => {
  const ipIpAddr = await getIpAddr();
  if (!ipIpAddr) {
    return;
  }
  const cookiePath = `${cookieDir}/${ipIpAddr}`;
  if (fs.existsSync(`${cookiePath}/${userName}.json`)) {
    const cookies = JSON.parse(
      fs.readFileSync(`${cookiePath}/${userName}.json`, { encoding: "utf8" })
    );
    const cookieJar = new CookieJar();
    cookies.forEach((cookie) => {
      cookieJar.setCookieSync(Cookie.parse(cookie), "https://cloud.189.cn");
    });
    return cookieJar;
  }
  return null;
};

const run = async (userName, password, userSizeInfoMap, logger) => {
  if (userName && password) {
    const before = Date.now();
    try {
      logger.log(`开始执行`);
      const cloudClient = new CloudClient(userName, password);
      if (cacheCookie) {
        const cookies = await loadCookies(userName);
        if (cookies) {
          cloudClient.cookieJar = cookies;
        } else {
          await cloudClient.login();
          await saveCookies(userName, cloudClient.cookieJar);
        }
      } else {
        await cloudClient.login();
      }
      const beforeUserSizeInfo = await cloudClient.getUserSizeInfo();
      userSizeInfoMap.set(userName, {
        cloudClient,
        userSizeInfo: beforeUserSizeInfo,
      });
      await Promise.all([
        doUserTask(cloudClient, logger),
        doFamilyTask(cloudClient, logger),
      ]);
    } catch (e) {
      if (e.response) {
        logger.log(`请求失败: ${e.response.statusCode}, ${e.response.body}`);
      } else {
        logger.error(e);
      }
      if (e.code === "ECONNRESET" || e.code === "ETIMEDOUT") {
        logger.error("请求超时");
        throw e;
      }
    } finally {
      logger.log(
        `执行完毕, 耗时 ${((Date.now() - before) / 1000).toFixed(2)} 秒`
      );
    }
  }
};

// 开始执行程序
async function main() {
  //用于统计实际容量变化
  const userSizeInfoMap = new Map();
  //分批执行
  const groupMaxNum = 5;
  const runTaskGroups = groupByNum(accounts, groupMaxNum)
  for (let index = 0; index < runTaskGroups.length; index++) {
    const taskGroup = runTaskGroups[index];
    await Promise.all(taskGroup.map((account) => {
      const { userName, password } = account;
      const userNameInfo = mask(userName, 3, 7);
      cleanLog(userName);
      const logger = log4js.getLogger(userName);
      logger.addContext("user", userNameInfo);
      return run(userName, password, userSizeInfoMap, logger);
    }));
  }

  //数据汇总
  for (const [userName, { cloudClient, userSizeInfo }] of userSizeInfoMap) {
    const afterUserSizeInfo = await cloudClient.getUserSizeInfo();
    const userNameInfo = mask(userName, 3, 7);
    const logger = log4js.getLogger(userName);
    logger.addContext("user", userNameInfo);
    logger.log(
      `个人总容量增加：${(
        (afterUserSizeInfo.cloudCapacityInfo.totalSize -
          userSizeInfo.cloudCapacityInfo.totalSize) /
        1024 /
        1024
      ).toFixed(2)}M,家庭容量增加：${(
        (afterUserSizeInfo.familyCapacityInfo.totalSize -
          userSizeInfo.familyCapacityInfo.totalSize) /
        1024 /
        1024
      ).toFixed(2)}M`
    );
  }
}

(async () => {
  try {
    await main();
    //等待日志文件写入
    await delay(1000);
  } finally {
    const logs = catLogs();
    const events = recording.replay();
    const content = events.map((e) => `${e.data.join("")}`).join("  \n");
    push("天翼云盘自动签到任务", logs + content);
    recording.erase();
  }
})();
