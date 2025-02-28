const fs = require("fs");
const path = require("path");
const superagent = require("superagent");

const mask = (s, start, end) => s.split("").fill("*", start, end).join("");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const formatDateISO = (date) => {
  const isoString = date.toISOString();
  const formattedDate = isoString.split("T")[0];
  return formattedDate;
};

const ipAddrHosts = [
  {
    url: "https://ipinfo.io/json",
    get: (res) => res["ip"],
  },
  {
    url: "https://ifconfig.me/all.json",
    get: (res) => res["ip_addr"],
  },
];

const getIpAddr = async () => {
  if (!process.env.IP_ADDRESS) {
    try {
      const requests = ipAddrHosts.map((host) =>
        superagent
          .get(host.url)
          .then((res) => host.get(res.body))
          .catch((error) => {
            throw new Error(
              `Failed to fetch IP from ${host.url} : ${error.message}`
            );
          })
      );
      const ipAddr = await Promise.any(requests);
      if (ipAddr) {
        process.env.IP_ADDRESS = ipAddr;
      }
    } catch (e) {}
  }
  return process.env.IP_ADDRESS;
};

function deleteNonTargetDirectories(dir, targetDirName) {
  if(!fs.existsSync(dir)) {
    return;
  }
  // 读取目录内容
  fs.readdir(dir, (err, files) => {
    if (err) {
      console.error("Error reading directory:", err);
      return;
    }

    // 遍历目录内容
    files.forEach((file) => {
      const filePath = path.join(dir, file);
      // 检查是否是目录
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error("Error getting file stats:", err);
          return;
        }
        if (stats.isDirectory()) {
          // 如果是目录且不是目标目录，删除整个目录
          if (file !== targetDirName) {
            fs.rm(filePath, { recursive: true, force: true }, (err) => {
              if (err) {
                console.error(`Error deleting directory ${filePath}:`, err);
              } else {
                console.log(`Deleted directory: ${filePath}`);
              }
            });
          }
        }
      });
    });
  });
}

function groupByNum(array, groupNum) {
  const result = [];
  for (let i = 0; i < array.length; i += groupNum) {
    result.push(array.slice(i, i + groupNum));
  }
  return result;
}

module.exports = {
  mask,
  delay,
  formatDateISO,
  getIpAddr,
  deleteNonTargetDirectories,
  groupByNum
};
