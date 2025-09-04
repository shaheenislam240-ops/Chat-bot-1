const fs = require("fs");
const request = require("request");

module.exports.config = {
  name: "boxinfo",
  version: "2.2.0",
  hasPermssion: 1,
  credits: "Modified by RX Abdullah",
  description: "Get stylish group info with same image system",
  commandCategory: "Box",
  usages: "groupinfo",
  cooldowns: 2
};

module.exports.run = async function ({ api, event }) {
  const threadInfo = await api.getThreadInfo(event.threadID);
  const members = threadInfo.participantIDs.length;
  const admins = threadInfo.adminIDs.length;
  const emoji = threadInfo.emoji || "❌";
  const groupName = threadInfo.threadName || "Unnamed Group";
  const groupID = threadInfo.threadID;
  const totalMsg = threadInfo.messageCount || 0;
  const approvalMode = threadInfo.approvalMode ? "🟢 Turned ON" : "🔴 Turned OFF";
  const groupImage = threadInfo.imageSrc;

  // Gender Count
  let male = 0, female = 0;
  for (const user of threadInfo.userInfo) {
    if (user.gender === "MALE") male++;
    else if (user.gender === "FEMALE") female++;
  }

  // Admin List
  const adminList = threadInfo.adminIDs.map(admin => {
    const user = threadInfo.userInfo.find(u => u.id === admin.id);
    return user ? `• ${user.name}` : null;
  }).filter(Boolean);

  const msg = `
╭───× 𝐆𝐫𝐨𝐮𝐩 𝐈𝐧𝐟𝐨 ×───╮
│ ᰔ 𝐌𝐚𝐫𝐢𝐚 × 𝐑𝐗 𝐂𝐡𝐚𝐭𝐛𝐨𝐭
│ ───×
│ 📛 𝗡𝗮𝗺𝗲: ${groupName}
│ 🆔 𝗚𝗿𝗼𝘂𝗽 𝗜𝗗: ${groupID}
│ 📩 𝗔𝗽𝗽𝗿𝗼𝘃𝗮𝗹: ${approvalMode}
│ 🎭 𝗘𝗺𝗼𝗷𝗶: ${emoji}
│ ───×
│ 👥 𝗠𝗲𝗺𝗯𝗲𝗿𝘀: ${members}
│ ♂️ 𝗠𝗮𝗹𝗲: ${male}
│ ♀️ 𝗙𝗲𝗺𝗮𝗹𝗲: ${female}
│ ───×
│ 👑 𝗔𝗱𝗺𝗶𝗻𝘀 (${admins}):
│ ${adminList.join("\n│ ")}
│ ───×
│ 💬 𝗧𝗼𝘁𝗮𝗹 𝗠𝗲𝘀𝘀𝗮𝗴𝗲𝘀: ${totalMsg} msgs
╰─────────────⧕
`.trim();

  const callback = () => {
    api.sendMessage(
      {
        body: msg,
        attachment: fs.createReadStream(__dirname + "/cache/1.png")
      },
      event.threadID,
      () => fs.unlinkSync(__dirname + "/cache/1.png"),
      event.messageID
    );
  };

  if (groupImage) {
    request(encodeURI(groupImage))
      .pipe(fs.createWriteStream(__dirname + "/cache/1.png"))
      .on("close", () => callback());
  } else {
    api.sendMessage(msg, event.threadID, event.messageID);
  }
};
