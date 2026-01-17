const {
  writeFileSync,
  existsSync,
  readJsonSync,
  ensureDirSync
} = require("fs-extra");
const { resolve } = require("path");

module.exports.config = {
  name: "admin",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "SHAAN",
  description: "Admin & Bot Control System",
  commandCategory: "Admin",
  usages: "admin [list/add/remove/addndh/removendh/only/qtvonly/ndhonly/ibonly]",
  cooldowns: 3
};

/* ================= LANGUAGE ================= */
module.exports.languages = {
  en: {
    listAdmin:
`╭──────〔 ADMIN LIST 〕──────╮
%1

╭──────〔 SUPPORTER 〕──────╮
%2
╰──────────────────────────╯`,
    notHavePermssion: "❌ You don't have permission to use: %1",
    addedNewAdmin: "✅ Added %1 Admin(s):\n\n%2",
    removedAdmin: "🗑 Removed %1 Admin(s):\n\n%2",
    addedNewNDH: "✅ Added %1 Supporter(s):\n\n%2",
    removedNDH: "🗑 Removed %1 Supporter(s):\n\n%2"
  }
};

/* ================= ON LOAD ================= */
module.exports.onLoad = () => {
  const dataPath = resolve(__dirname, "cache", "data.json");
  ensureDirSync(resolve(__dirname, "cache"));

  if (!existsSync(dataPath)) {
    writeFileSync(
      dataPath,
      JSON.stringify({ adminbox: {} }, null, 4)
    );
  }
};

/* ================= RUN ================= */
module.exports.run = async function ({
  api,
  event,
  args,
  Users,
  permssion,
  getText
}) {
  const { threadID, messageID, mentions } = event;
  const configPath = global.client.configPath;
  const config = require(configPath);

  const ADMINBOT = config.ADMINBOT || [];
  const NDH = config.NDH || [];

  const dataPath = resolve(__dirname, "cache", "data.json");
  const database = readJsonSync(dataPath);
  const adminbox = database.adminbox;

  const saveConfig = () =>
    writeFileSync(configPath, JSON.stringify(config, null, 4));

  /* ================= HELP ================= */
  if (!args[0]) {
    return api.sendMessage(
`╭────〔 ADMIN SETTINGS 〕────╮
• admin list
• admin add @tag / uid
• admin remove @tag / uid
• admin addndh
• admin removendh
• admin only
• admin qtvonly
• admin ndhonly
• admin ibonly
╰──────────────────────────╯`,
      threadID,
      messageID
    );
  }

  const targetIDs =
    Object.keys(mentions).length > 0
      ? Object.keys(mentions)
      : args[1]
      ? [args[1]]
      : event.type === "message_reply"
      ? [event.messageReply.senderID]
      : [];

  /* ================= SWITCH ================= */
  switch (args[0]) {
    /* ===== LIST ===== */
    case "list":
    case "all": {
      const adminList = await Promise.all(
        ADMINBOT.map(async id => {
          const name = (await Users.getData(id)).name;
          return `👑 ${name}\n└─ ${id}`;
        })
      );

      const ndhList = await Promise.all(
        NDH.map(async id => {
          const name = (await Users.getData(id)).name;
          return `🛠 ${name}\n└─ ${id}`;
        })
      );

      return api.sendMessage(
        getText(
          "listAdmin",
          adminList.join("\n\n") || "Empty",
          ndhList.join("\n\n") || "Empty"
        ),
        threadID,
        messageID
      );
    }

    /* ===== ADD ADMIN ===== */
    case "add": {
      if (permssion !== 3)
        return api.sendMessage(
          getText("notHavePermssion", "add"),
          threadID,
          messageID
        );

      let added = [];
      for (const id of targetIDs) {
        if (!ADMINBOT.includes(id)) {
          ADMINBOT.push(id);
          config.ADMINBOT.push(id);
          const name = (await Users.getData(id)).name;
          added.push(`${name} (${id})`);
        }
      }

      saveConfig();
      return api.sendMessage(
        getText("addedNewAdmin", added.length, added.join("\n")),
        threadID,
        messageID
      );
    }

    /* ===== REMOVE ADMIN ===== */
    case "remove":
    case "rm": {
      if (permssion !== 3)
        return api.sendMessage(
          getText("notHavePermssion", "remove"),
          threadID,
          messageID
        );

      let removed = [];
      for (const id of targetIDs) {
        const index = ADMINBOT.indexOf(id);
        if (index !== -1) {
          ADMINBOT.splice(index, 1);
          config.ADMINBOT.splice(index, 1);
          const name = (await Users.getData(id)).name;
          removed.push(`${name} (${id})`);
        }
      }

      saveConfig();
      return api.sendMessage(
        getText("removedAdmin", removed.length, removed.join("\n")),
        threadID,
        messageID
      );
    }

    /* ===== ADD NDH ===== */
    case "addndh": {
      if (permssion !== 3)
        return api.sendMessage(
          getText("notHavePermssion", "addndh"),
          threadID,
          messageID
        );

      let added = [];
      for (const id of targetIDs) {
        if (!NDH.includes(id)) {
          NDH.push(id);
          config.NDH.push(id);
          const name = (await Users.getData(id)).name;
          added.push(`${name} (${id})`);
        }
      }

      saveConfig();
      return api.sendMessage(
        getText("addedNewNDH", added.length, added.join("\n")),
        threadID,
        messageID
      );
    }

    /* ===== REMOVE NDH ===== */
    case "removendh": {
      if (permssion !== 3)
        return api.sendMessage(
          getText("notHavePermssion", "removendh"),
          threadID,
          messageID
        );

      let removed = [];
      for (const id of targetIDs) {
        const index = NDH.indexOf(id);
        if (index !== -1) {
          NDH.splice(index, 1);
          config.NDH.splice(index, 1);
          const name = (await Users.getData(id)).name;
          removed.push(`${name} (${id})`);
        }
      }

      saveConfig();
      return api.sendMessage(
        getText("removedNDH", removed.length, removed.join("\n")),
        threadID,
        messageID
      );
    }

    /* ===== QTV ONLY ===== */
    case "qtvonly": {
      if (permssion < 1)
        return api.sendMessage("❌ Permission denied", threadID, messageID);

      adminbox[threadID] = !adminbox[threadID];
      writeFileSync(dataPath, JSON.stringify(database, null, 4));

      return api.sendMessage(
        adminbox[threadID]
          ? "✅ QTV-only mode enabled"
          : "❌ QTV-only mode disabled",
        threadID,
        messageID
      );
    }

    /* ===== NDH ONLY ===== */
    case "ndhonly": {
      if (permssion < 2)
        return api.sendMessage("❌ Permission denied", threadID, messageID);

      config.ndhOnly = !config.ndhOnly;
      saveConfig();

      return api.sendMessage(
        config.ndhOnly
          ? "✅ NDH-only mode enabled"
          : "❌ NDH-only mode disabled",
        threadID,
        messageID
      );
    }

    /* ===== IB ONLY ===== */
    case "ibonly": {
      if (permssion !== 3)
        return api.sendMessage("❌ Permission denied", threadID, messageID);

      config.adminPaOnly = !config.adminPaOnly;
      saveConfig();

      return api.sendMessage(
        config.adminPaOnly
          ? "✅ Inbox-only enabled"
          : "❌ Inbox-only disabled",
        threadID,
        messageID
      );
    }

    /* ===== ADMIN ONLY ===== */
    case "only": {
      if (permssion !== 3)
        return api.sendMessage("❌ Permission denied", threadID, messageID);

      config.adminOnly = !config.adminOnly;
      saveConfig();

      return api.sendMessage(
        config.adminOnly
          ? "✅ Admin-only enabled"
          : "❌ Admin-only disabled",
        threadID,
        messageID
      );
    }

    default:
      return global.utils.throwError(
        this.config.name,
        threadID,
        messageID
      );
  }
};
