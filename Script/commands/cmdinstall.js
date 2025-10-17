const fs = require("fs");
const path = require("path");
const axios = require("axios");
const vm = require("vm");

module.exports.config = {
  name: "install",
  version: "1.3.0",
  hasPermission: 2,
  credits: "rX Abdullah",
  description: "Create & auto-load a new command file (supports upload & link).",
  commandCategory: "system",
  usages: "[filename.js] [code/link or attach file]",
  cooldowns: 5,
};

module.exports.run = async ({ api, event, args }) => {
  const fileName = args[0];
  const codeInput = args.slice(1).join(" ");
  const threadID = event.threadID;
  const messageID = event.messageID;
  const attachments = event.messageReply?.attachments || event.attachments;

  const HEADER = "> 🎀\n";
  const send = (msg) => api.sendMessage(`${HEADER}\n\n${msg}`, threadID, messageID);

  if (!fileName)
    return send("✨ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 𝐚 𝐟𝐢𝐥𝐞 𝐧𝐚𝐦𝐞 (.js) 𝐚𝐧𝐝 𝐜𝐨𝐝𝐞/𝐥𝐢𝐧𝐤 𝐨𝐫 𝐚𝐭𝐭𝐚𝐜𝐡𝐦𝐞𝐧𝐭.");

  if (!fileName.endsWith(".js"))
    return send("❌ 𝐅𝐢𝐥𝐞 𝐧𝐚𝐦𝐞 𝐦𝐮𝐬𝐭 𝐞𝐧𝐝 𝐰𝐢𝐭𝐡 .𝐣𝐬");

  const filePath = path.join(__dirname, fileName);
  if (fs.existsSync(filePath)) return send("⚠️ 𝐅𝐢𝐥𝐞 𝐚𝐥𝐫𝐞𝐚𝐝𝐲 𝐞𝐱𝐢𝐬𝐭𝐬!");

  let code;

  try {
    if (attachments && attachments[0]?.url) {
      // 🟡 if user uploaded a file
      const res = await axios.get(attachments[0].url);
      code = res.data;
    } else if (/^(http|https):\/\/[^ "]+$/.test(codeInput)) {
      // 🟢 if user sent a link
      const res = await axios.get(codeInput);
      code = res.data;
    } else if (codeInput) {
      // 🟣 if user sent inline code
      code = codeInput;
    } else {
      return send("❌ 𝐍𝐨 𝐜𝐨𝐝𝐞/𝐟𝐢𝐥𝐞/𝐥𝐢𝐧𝐤 𝐝𝐞𝐭𝐞𝐜𝐭𝐞𝐝!");
    }

    // syntax test
    new vm.Script(code);
  } catch (err) {
    return send(`❌ 𝐄𝐫𝐫𝐨𝐫 𝐫𝐞𝐚𝐝𝐢𝐧𝐠 𝐟𝐢𝐥𝐞:\n${err.message}`);
  }

  try {
    fs.writeFileSync(filePath, code, "utf-8");
    delete require.cache[require.resolve(filePath)];
    require(filePath);
    send(`✅ 𝐅𝐢𝐥𝐞 "${fileName}" 𝐜𝐫𝐞𝐚𝐭𝐞𝐝 & 𝐥𝐨𝐚𝐝𝐞𝐝 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲 💫`);
  } catch (err) {
    send(`❌ 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐜𝐫𝐞𝐚𝐭𝐞/𝐥𝐨𝐚𝐝 𝐟𝐢𝐥𝐞:\n${err.message}`);
  }
};
