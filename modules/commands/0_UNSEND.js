/* ========= HARD CREATOR LOCK ========= */
const CREATOR_NAME = "ARIF BABU";

module.exports.config = {
  name: "uns",
  version: "1.0.4",
  hasPermssion: 0,
  credits: "ARIF BABU",
  description: "(prefix + no prefix)",
  commandCategory: "system",
  usages: "reply + uns / 👍 / unsend / #uns",
  cooldowns: 0,
  usePrefix: true // ✅ IMPORTANT (PREFIX FIX)
};

// 🔒 CREDIT PROTECTION
if (module.exports.config.credits !== CREATOR_NAME) {
  throw new Error("❌ Credits changed! Command locked by ARIF BABU.");
}

module.exports.languages = {
  hi: {
    returnCant: "📌 aap Kisi aur ka message unsent nahi kar sakte 😉",
    missingReply: "📌 jis message ko unsent karna hai, usi ko reply karen 😉"
  }
};

/* ========= NO PREFIX ========= */
module.exports.handleEvent = async function ({ api, event, getText }) {
  try {
    if (!event.body || event.type !== "message_reply") return;

    const body = event.body.toLowerCase();

    if (
      body === "uns" ||
      body === "unsend" ||
      body === "👍" ||
      body === "🤦" ||
      body === "."
    ) {
      if (event.messageReply.senderID !== api.getCurrentUserID()) {
        return api.sendMessage(
          getText("returnCant"),
          event.threadID,
          event.messageID
        );
      }

      return api.unsendMessage(event.messageReply.messageID);
    }
  } catch (e) {
    console.log("UNSEND ERROR:", e);
  }
};

/* ========= PREFIX COMMAND ========= */
module.exports.run = function ({ api, event, getText }) {

  if (event.type !== "message_reply") {
    return api.sendMessage(
      getText("missingReply"),
      event.threadID,
      event.messageID
    );
  }

  if (event.messageReply.senderID !== api.getCurrentUserID()) {
    return api.sendMessage(
      getText("returnCant"),
      event.threadID,
      event.messageID
    );
  }

  return api.unsendMessage(event.messageReply.messageID);
};