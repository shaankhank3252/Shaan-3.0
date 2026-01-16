module.exports.config = {
	name: "res",
	version: "1.0.0",
	hasPermssion: 2,
	credits: "ARIF BABU",
	description: "Restart Bot",
	commandCategory: "system",
	usages: "",
	cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
	const { threadID, messageID } = event;
	return api.sendMessage(` ⥤↻⥢ ${global.config.BOTNAME} 𝕚𝕤 𝕟𝕠𝕨 ℝ𝕖𝕤𝕥𝕒𝕣𝕥𝕚𝕟𝕘.....................................................................................`, threadID, () => process.exit(1));
}
