module.exports.config = {
  name: "out",
  version: "1.0.0",
  hasPermssion: 2, // Admin / Owner only
  credits: "ARIF BABU",
  description: "Bot leave from group (prefix & no-prefix)",
  usePrefix: true,
  commandCategory: "admin",
  usages: "out",
  cooldowns: 3
};

module.exports.run = async function ({ api, event, args }) {
  if (event.threadID == event.senderID) {
    return api.sendMessage(
      "❌ Ye command sirf group me kaam karta hai.",
      event.threadID
    );
  }

  return api.sendMessage(
    "👋 Bye Bye!\nBot group chhod raha hai...",
    event.threadID,
    () => api.removeUserFromGroup(api.getCurrentUserID(), event.threadID)
  );
};

/* -------- NO PREFIX SUPPORT -------- */
module.exports.handleEvent = async function ({ api, event }) {
  if (!event.body) return;

  const msg = event.body.toLowerCase().trim();

  if (msg === "out") {
    // Sirf group me
    if (event.threadID == event.senderID) return;

    // Sender admin hai ya nahi
    const threadInfo = await api.getThreadInfo(event.threadID);
    const isAdmin = threadInfo.adminIDs.some(
      item => item.id == event.senderID
    );

    if (!isAdmin) {
      return api.sendMessage(
        "❌ Sirf group admin hi bot ko out kar sakta hai.",
        event.threadID
      );
    }

    return api.sendMessage(
      "👋 Bye Bye!\nBot group chhod raha hai...",
      event.threadID,
      () => api.removeUserFromGroup(api.getCurrentUserID(), event.threadID)
    );
  }
};