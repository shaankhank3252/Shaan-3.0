const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const os = require("os");

module.exports.config = {
  name: "adbot",
  version: "2.1.0",
  hasPermssion: 0,
  credits: "ARIF BABU",
  description: "Advanced Info Command",
  commandCategory: "info",
  usages: "[user | user @tag | user uid | box | admin]",
  cooldowns: 4
};

// CACHE FOLDER
const cacheDir = path.join(__dirname, "cache");
if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

module.exports.run = async ({ api, event, args }) => {
  const threadID = event.threadID;
  const messageID = event.messageID;

  const threadSetting =
    global.data.threadData.get(parseInt(threadID)) || {};
  const prefix = threadSetting.PREFIX || global.config.PREFIX;

  // ================= HELP =================
  if (!args[0]) {
    return api.sendMessage(
      `📌 Usage Guide:\n\n` +
      `${prefix}adbot user → Your info\n` +
      `${prefix}adbot user @tag → Tagged user info\n` +
      `${prefix}adbot user <uid> → User by UID\n` +
      `${prefix}adbot box → Group info\n` +
      `${prefix}adbot box <tid> → Other group info\n` +
      `${prefix}adbot admin → Bot admin & system info`,
      threadID,
      messageID
    );
  }

  // ================= BOX INFO =================
  if (args[0] === "box") {
    const tid = args[1] || threadID;
    const info = await api.getThreadInfo(tid);

    let male = 0, female = 0;
    info.userInfo.forEach(u => {
      u.gender === "MALE" ? male++ : female++;
    });

    const approval = info.approvalMode ? "ON" : "OFF";
    const imgPath = path.join(cacheDir, "box.png");

    const body =
      `╭───────────〔 GROUP INFO 〕───────────╮\n\n` +
      `🏠 Name      : ${info.threadName}\n` +
      `🆔 TID       : ${tid}\n` +
      `🔐 Approval  : ${approval}\n` +
      `😀 Emoji     : ${info.emoji}\n\n` +
      `👥 Members   : ${info.participantIDs.length}\n` +
      `🛡 Admins    : ${info.adminIDs.length}\n` +
      `👦 Male      : ${male}\n` +
      `👧 Female    : ${female}\n` +
      `💬 Messages  : ${info.messageCount}\n\n` +
      `╰────────────────────────────────────╯`;

    if (!info.imageSrc)
      return api.sendMessage(body, threadID, messageID);

    const img = await axios.get(info.imageSrc, { responseType: "stream" });
    img.data.pipe(fs.createWriteStream(imgPath)).on("finish", () => {
      api.sendMessage(
        { body, attachment: fs.createReadStream(imgPath) },
        threadID,
        () => fs.unlinkSync(imgPath),
        messageID
      );
    });
    return;
  }

  // ================= ADMIN =================
  if (args[0] === "admin") {
    const imgPath = path.join(cacheDir, "admin.png");
    const adminID = "61572909482910";

    // ⏳ UPTIME
    const uptime = process.uptime();
    const d = Math.floor(uptime / 86400);
    const h = Math.floor((uptime % 86400) / 3600);
    const m = Math.floor((uptime % 3600) / 60);
    const s = Math.floor(uptime % 60);
    const uptimeStr = `${d}d ${h}h ${m}m ${s}s`;

    // 📅 DATE & TIME
    const now = new Date();
    const date = now.toLocaleDateString("en-IN");
    const time = now.toLocaleTimeString("en-IN");

    // 💾 RAM
    const usedRam = (process.memoryUsage().rss / 1024 / 1024).toFixed(2);
    const totalRam = (os.totalmem() / 1024 / 1024).toFixed(0);

    const img = await axios.get(
      `https://graph.facebook.com/${adminID}/picture?height=720&width=720`,
      { responseType: "stream" }
    );

    img.data.pipe(fs.createWriteStream(imgPath)).on("finish", () => {
      api.sendMessage(
        {
          body:
`╭───────────〔 ADMIN 〕───────────╮

🤖 Bot Name : ${global.config.BOTNAME}
⏳ Uptime   : ${uptimeStr}

╭───────────〔 SYSTEM 〕───────────╮
📅 Date     : ${date}
⏰ Time     : ${time}
💾 RAM      : ${usedRam} MB / ${totalRam} MB

╰──────────────────────────────────╯`,
          attachment: fs.createReadStream(imgPath)
        },
        threadID,
        () => fs.unlinkSync(imgPath),
        messageID
      );
    });
    return;
  }

  // ================= USER INFO =================
  if (args[0] === "user") {
    let uid;

    if (Object.keys(event.mentions).length)
      uid = Object.keys(event.mentions)[0];
    else if (args[1])
      uid = args[1];
    else
      uid = event.senderID;

    const data = await api.getUserInfo(uid);
    const u = data[uid];

    const gender =
      u.gender === 2 ? "Male" :
      u.gender === 1 ? "Female" : "Unknown";

    const imgPath = path.join(cacheDir, "user.png");

    const img = await axios.get(
      `https://graph.facebook.com/${uid}/picture?height=720&width=720`,
      { responseType: "stream" }
    );

    img.data.pipe(fs.createWriteStream(imgPath)).on("finish", () => {
      api.sendMessage(
        {
          body:
`╭───────────〔 USER INFO 〕───────────╮

👤 Name     : ${u.name}
🆔 UID      : ${uid}
🔗 Profile  : ${u.profileUrl}
🏷 Username : ${u.vanity || "None"}
⚥ Gender   : ${gender}
🤝 Friend  : ${u.isFriend ? "Yes" : "No"}

╰────────────────────────────────────╯`,
          attachment: fs.createReadStream(imgPath)
        },
        threadID,
        () => fs.unlinkSync(imgPath),
        messageID
      );
    });
  }
};