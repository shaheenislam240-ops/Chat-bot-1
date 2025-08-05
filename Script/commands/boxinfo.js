const fs = require("fs");
const request = require("request");

module.exports.config = {
  name: "boxinfo",
  version: "2.1.0",
  hasPermssion: 1,
  credits: "Modified by RX Abdullah",
  description: "Get detailed and stylish group info",
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

  // Count genders
  let male = 0, female = 0;
  for (const user of threadInfo.userInfo) {
    if (user.gender === "MALE") male++;
    else if (user.gender === "FEMALE") female++;
  }

  // Admin list
  const adminList = threadInfo.adminIDs.map(admin => {
    const user = threadInfo.userInfo.find(u => u.id === admin.id);
    return user ? `• ${user.name}` : null;
  }).filter(Boolean);

  const msg = `
╔═════════════◆◇◆═════════════╗
🔧 𝙂𝙧𝙤𝙪𝙥 𝙄𝙣𝙛𝙤 𝙍𝙚𝙥𝙤𝙧𝙩
╚═════════════◆◇◆═════════════╝

📛 𝗡𝗮𝗺𝗲: ${groupName}
🆔 𝗚𝗿𝗼𝘂𝗽 𝗜𝗗: ${groupID}
📩 𝗔𝗽𝗽𝗿𝗼𝘃𝗮𝗹: ${approvalMode}
🎭 𝗘𝗺𝗼𝗷𝗶: ${emoji}

👥 𝗧𝗼𝘁𝗮𝗹 𝗠𝗲𝗺𝗯𝗲𝗿𝘀: ${members}
♂️ 𝗠𝗮𝗹𝗲: ${male}
♀️ 𝗙𝗲𝗺𝗮𝗹𝗲: ${female}

👑 𝗔𝗱𝗺𝗶𝗻𝘀 (${admins}):
${adminList.join("\n")}

💬 𝗧𝗼𝘁𝗮𝗹 𝗠𝗲𝘀𝘀𝗮𝗴𝗲𝘀: ${totalMsg} msgs

╔═════════════★═════════════╗
🎀  𝗠𝗮𝗱𝗲 𝘄𝗶𝘁𝗵 : 𝗥𝗫 𝗔𝗯𝗱𝘂𝗹𝗹𝗮𝗵   🎀
╚═════════════★═════════════╝
  `.trim();

  if (groupImage) {
    const path = __dirname + "/cache/1.png";
    request(encodeURI(groupImage))
      .pipe(fs.createWriteStream(path))
      .on("close", () => {
        api.sendMessage({
          body: msg,
          attachment: fs.createReadStream(path)
        }, event.threadID, () => fs.unlinkSync(path), event.messageID);
      });
  } else {
    api.sendMessage(msg, event.threadID, event.messageID);
  }
};
