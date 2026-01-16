module.exports = function ({ api, models }) {
  const fs = require("fs");
  const moment = require('moment-timezone');
  const axios = require("axios");
  const config = require("./../config.json");

  const Users = require("./controllers/users")({ models, api }),
        Threads = require("./controllers/threads")({ models, api }),
        Currencies = require("./controllers/currencies")({ models });
  const logger = require("../utils/log.js");

  /////////////////////////////////////////////////////////////////////////////
  // NOTIFICATION HANDLER
  setInterval(function () {
    if (global.config.NOTIFICATION) {        
      require("./handle/handleNotification.js")({ api });
    }
  }, 1000 * 60);

  /////////////////////////////////////////////////////////////////////////////
  (async function () {
    try {
      logger(global.getText('listen', 'startLoadEnvironment'), '[ DATABASE ]');

      let threads = await Threads.getAll(),
          users = await Users.getAll(['userID', 'name', 'data']),
          currencies = await Currencies.getAll(['userID']);

      for (const data of threads) {
        const idThread = String(data.threadID);
        global.data.allThreadID.push(idThread);
        global.data.threadData.set(idThread, data.data || {});
        global.data.threadInfo.set(idThread, data.threadInfo || {});
      }

      for (const dataU of users) {
        const idUsers = String(dataU.userID);
        global.data.allUserID.push(idUsers);
        if (dataU.name) global.data.userName.set(idUsers, dataU.name);
      }

      for (const dataC of currencies) {
        global.data.allCurrenciesID.push(String(dataC.userID));
      }

      logger.loader(global.getText('listen', 'loadedEnvironmentThread'));
    } catch (error) {
      return logger.loader(global.getText('listen', 'failLoadEnvironment', error), 'error');
    }
  })();

  /////////////////////////////////////////////////////////////////////////////

  const admin = global.config.ADMINBOT || [];
  logger("┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓", "[ SYSTEM ]");
  admin.forEach((id, i) => logger(` ADMIN ID ${i + 1}: ${id}`, "[ ADMIN ]"));
  logger(` BOT ID: ${api.getCurrentUserID()}`, "[ SYSTEM ]");
  logger(` PREFIX: ${global.config.PREFIX}`, "[ SYSTEM ]");
  logger(` BOT NAME: ${global.config.BOTNAME}`, "[ SYSTEM ]");
  logger("┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛", "[ SYSTEM ]");

  /////////////////////////////////////////////////////////////////////////////

  const handleCommand = require("./handle/handleCommand")({ api, models, Users, Threads, Currencies });
  const handleCommandEvent = require("./handle/handleCommandEvent")({ api, models, Users, Threads, Currencies });
  const handleReply = require("./handle/handleReply")({ api, models, Users, Threads, Currencies });
  const handleReaction = require("./handle/handleReaction")({ api, models, Users, Threads, Currencies });
  const handleEvent = require("./handle/handleEvent")({ api, models, Users, Threads, Currencies });
  const handleRefresh = require("./handle/handleRefresh")({ api, models, Users, Threads, Currencies });
  const handleCreateDatabase = require("./handle/handleCreateDatabase")({ api, Threads, Users, Currencies, models });

  /////////////////////////////////////////////////////////////////////////////

  return async (event) => {
    const { type, threadID, senderID } = event;

    const isInbox = threadID === senderID;

    switch (type) {

      case "message":
      case "message_reply":
      case "message_unsend":

        // ❌ Inbox me thread DB mat use karo
        if (!isInbox) {
          handleCreateDatabase({ event });
        }

        // ✅ Inbox + Group dono me command allow
        handleCommand({ event });
        handleReply({ event });
        handleCommandEvent({ event });
        break;

      case "event":
        if (!isInbox) {
          handleEvent({ event });
          handleRefresh({ event });
        }
        break;

      case "message_reaction":
        try {
          const BOT_ID = api.getCurrentUserID();
          const ADMIN_IDS = [
            ...(global.config.ADMINBOT || []),
            ...(global.config.NDH || [])
          ];

          const UNSEND_REACTIONS = ["😉", "❤️", "🙄", "😡"];

          if (
            event.userID !== BOT_ID &&
            ADMIN_IDS.includes(event.userID) &&
            UNSEND_REACTIONS.includes(event.reaction) &&
            event.messageID
          ) {
            return api.unsendMessage(event.messageID);
          }
        } catch (e) {
          console.log("UNSEND ERROR:", e);
        }

        handleReaction({ event });
        break;
    }
  };
};