const fs = require("fs");
const path = require("path");
const moment = require("moment-timezone");

module.exports.config = {
  name: "ghum",
  version: "1.0.0",
  hasPermission: 0,
  credits: "Rx Abdullah",
  description: "",
  commandCategory: "system",
  cooldowns: 5,
};

module.exports.onLoad = function ({ api }) {
  setInterval(async () => {
    const now = moment().tz("Asia/Dhaka");
    const hour = now.hour();
    const minute = now.minute();
    const second = now.second();

    if (hour === 4 && minute === 0 && second === 0) {
      const filePath = path.join(__dirname, "catch", "ghum.mp4");
      if (!fs.existsSync(filePath)) return console.log("⚠️ ghum.mp4 not found!");

      const groupList = global.data.allThreadID;
      for (const threadID of groupList) {
        try {
          await api.sendMessage(
            {
              body: "😴 𝐬𝐨𝐛𝐚𝐢 𝐠𝐡𝐮𝐦𝐚𝐭𝐬𝐞 💫",
              attachment: fs.createReadStream(filePath),
            },
            threadID
          );
          console.log(`✅ Sent ghum.mp4 to ${threadID}`);
        } catch {
          console.log(`❌ Failed to send ghum.mp4 in group ${threadID}`);
        }
      }
    }
  }, 1000);
};

module.exports.run = function () {};
