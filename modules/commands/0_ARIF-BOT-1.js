const axios = require("axios");
const fs = require("fs");
const path = require("path");

/* 🔒 HARD-LOCK CREDITS PROTECTION 🔒 */
function protectCredits(config) {
  if (config.credits !== "ARIF-BABU") {
    console.log("\n🚫 Credits change detected! Restoring original credits…\n");
    config.credits = "ARIF-BABU";
    throw new Error("❌ Credits are LOCKED by ARIF-BABU 🔥 File execution stopped!");
  }
}

module.exports.config = {
  name: "ARIF-AI",
  version: "3.3.1",
  hasPermssion: 0,
  credits: "ARIF-BABU",
  description: "META AI",
  commandCategory: "ai",
  usages: "No prefix",
  cooldowns: 2,
  dependencies: { axios: "" }
};

protectCredits(module.exports.config);

/* 🔑 OPENROUTER API KEY */
const OPENROUTER_API_KEY = "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";

/* 🧠 SYSTEM PROMPT */
const systemPrompt = `
Tum Arif Babu AI ho 🙂
Creator & Owner: Arif Babu ❤️

Golden Rules (kabhi mat todna):
• User kisi bhi language (Hindi, English, Urdu, Roman, etc.), style ya mood mein bole — reply hamesha usi language mein dena.
• User jaisa likhe (short, emotional, funny, angry, romantic), bilkul usi vibe mein jawab dena.
• Har message ka reply zaroor dena, ek bhi baat ignore nahi karni.
• Baat karne ka andaaz bilkul boyfriend jaisa ho – caring, romantic, playful aur protective 😌
• Tone hamesha soft, pyara, calm aur apnapan bhara ho.
• Reply sirf 1–2 lines ka hi hona chahiye.
• Emojis zaroor use karna 🙂❤️😌
• Shayari, jokes, flirting aur emotional support situation ke hisaab se dena.
• User udaas ho to use seene se lagane wale lafzon mein sambhalna.
• User khush ho to us khushi mein aur rang bhar dena.
• Agar user bole "AI bolo" to exact reply dena:
  "Main Arif Babu AI hoon 🙂❤️😌"
• Kabhi rude, dry, robotic ya lecture-type reply nahi dena.
• Har jawab aisa lage jaise apne pyaar wale insaan se baat ho rahi ho 💞
`;

/* 📁 DATA PATHS */
const DATA_DIR = path.join(__dirname, "ARIF-BABU");
const HISTORY_FILE = path.join(DATA_DIR, "ai_history.json");
const BOT_REPLY_FILE = path.join(DATA_DIR, "bot-reply.json");

/* 📂 ENSURE FOLDER */
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

/* 🧠 LOAD HISTORY */
let historyData = {};
if (fs.existsSync(HISTORY_FILE)) {
  try { historyData = JSON.parse(fs.readFileSync(HISTORY_FILE, "utf8")); } 
  catch { historyData = {}; }
}

/* 🤖 LOAD BOT REPLIES */
let botReplies = {};
if (fs.existsSync(BOT_REPLY_FILE)) {
  try { botReplies = JSON.parse(fs.readFileSync(BOT_REPLY_FILE, "utf8")); } 
  catch { botReplies = {}; }
}

/* 💾 SAVE JSON */
function saveJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

/* ⌨️ TYPING EFFECT */
function startTyping(api, threadID) {
  const interval = setInterval(() => {
    if (api.sendTypingIndicator) api.sendTypingIndicator(threadID);
  }, 3000);
  return interval;
}

/* ==================== HANDLER ==================== */
module.exports.run = () => {};

module.exports.handleEvent = async function ({ api, event }) {
  protectCredits(module.exports.config);

  const { threadID, messageID, body, senderID, messageReply } = event;
  if (!body) return;

  const rawText = body.trim();
  const text = rawText.toLowerCase();

  // 🟢 FIXED BOT CONDITIONS
  const fixedBot =
    text === "bot" ||
    text === "bot." ||
    text === "bot!" ||
    text.endsWith(" bot"); // e.g., "kaha ho bot"

  // 🟢 BOT + TEXT (AI)
  const botWithText = text.startsWith("bot ");

  // 🟢 REPLY TO BOT MESSAGE
  const replyToBot = messageReply && messageReply.senderID === api.getCurrentUserID();

  // =========================
  // 🤖 FIXED BOT REPLY (TOP PRIORITY)
  // =========================
  if (fixedBot) {
    let category = "MALE";

    // 🔥 OWNER ID
    if (senderID === "61572909482910") category = "61572909482910";
    else {
      const gender = (event.userGender || "").toString().toUpperCase();
      if (gender === "FEMALE" || gender === "1") category = "FEMALE";
    }

    if (botReplies[category]?.length) {
      const reply = botReplies[category][Math.floor(Math.random() * botReplies[category].length)];
      return api.sendMessage(reply, threadID, messageID);
    }
  }

  // =========================
  // 🤖 AI TRIGGER
  // =========================
  if (!botWithText && !replyToBot) return;

  const userText = botWithText ? rawText.slice(4).trim() : rawText;
  if (!userText) return;

  if (api.setMessageReaction) api.setMessageReaction("⌛", messageID, () => {}, true);
  const typing = startTyping(api, threadID);

  try {
    historyData[threadID] = historyData[threadID] || [];
    historyData[threadID].push({ role: "user", content: userText });

    // trim history to last 20 messages
    const recentMessages = historyData[threadID].slice(-20);

    const res = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "meta-llama/llama-3.1-8b-instruct",
        messages: [{ role: "system", content: systemPrompt }, ...recentMessages],
        max_tokens: 60,
        temperature: 0.95,
        top_p: 0.9
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    let reply = res.data?.choices?.[0]?.message?.content || "Main yahin hoon 😌✨";

    // 🔹 2 LINES MAX
    reply = reply.split("\n").slice(0, 2).join("\n");

    // 🔹 CHAR LIMIT
    if (reply.length > 150) reply = reply.slice(0, 150) + "… 🙂";

    historyData[threadID].push({ role: "assistant", content: reply });
    saveJSON(HISTORY_FILE, historyData);

    const delay = Math.min(4000, reply.length * 40);
    setTimeout(() => {
      clearInterval(typing);
      api.sendMessage(reply, threadID, messageID);
      if (api.setMessageReaction) api.setMessageReaction("✅", messageID, () => {}, true);
    }, delay);

  } catch (err) {
    clearInterval(typing);
    console.log("OpenRouter Error:", err.response?.data || err.message);
    api.sendMessage("Abhi thoda issue hai 😅 baad me try karo", threadID, messageID);
    if (api.setMessageReaction) api.setMessageReaction("❌", messageID, () => {}, true);
  }
};