let antiGaliStatus = true; // Default ON

const badWords = [
  "হারামি", "হারাম", "কুত্তা", "কুত্তির বাচ্চা", "কুত্তার বাচ্চা", 
  "মাগী", "মাগীচোদ", "চোদা", "চুদ", "চুদা", "চুদামারান", 
  "চুদির", "চুত", "চুদি", "চুতমারানি", "চুদের বাচ্চা", 
  "বাল", "বালের", "বালের কাজ", "বালের ছেলে", "বালছাল", 
  "বালছাল কথা", "মাগীর ছেলে", "রান্ডি", "রান্দি", 
  "রান্দির ছেলে", "বেশ্যা", "বেশ্যাপনা", 
  "তোর মায়ের", "তোর মায়েরে", "তোর বাপের", "তোর বাবার", 
  "তোকে চুদি", "তুই হারামি", "তুই কুত্তা", "তুই চুদ",
  "fuck", "f***", "f*ck", "fu*k", "fuk", "fking", "f***ing", "fucking", 
  "motherfucker", "mf", "mfer", "motherfu**er", "mthrfckr", 
  "bitch", "b!tch", "biatch", "slut", "whore", "bastard", 
  "asshole", "a$$hole", "a**hole", "dick", "d!ck", "cock", 
  "prick", "pussy", "pu$$y", "cunt", "fag", "faggot", "retard",
  "harami", "kutte", "kutti", "magi", "magir", "magirchele", 
  "rand", "randir", "randirchele", "baler", "bal", "balsal", 
  "chuda", "chud", "chudir", "chut", "chudi", "chutmarani", 
  "tor mayer", "tor baper", "tui harami", "toke chudi", "chod"
];

module.exports.config = {
  name: "antigali",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Rx Abdullah",
  description: "Auto offensive word detector with ON/OFF system",
  commandCategory: "moderation",
  usages: "!antigali on / !antigali off",
  cooldowns: 0
};

// Listening for offensive words
module.exports.handleEvent = async function ({ api, event }) {
  try {
    if (!antiGaliStatus) return; // যদি অফ থাকে, কাজ করবে না
    if (!event.body) return;
    const message = event.body.toLowerCase();

    if (badWords.some(word => message.includes(word))) {
      const warningMsg = 
`𝗔𝗨𝗧𝗢𝗠𝗢𝗗 𝗔𝗟𝗘𝗥𝗧 🚫
╔════════════════════════════════╗
║ 𝗪𝗔𝗥𝗡𝗜𝗡𝗚 ❗ 𝗢𝗳𝗳𝗲𝗻𝘀𝗶𝘃𝗲 𝗟𝗮𝗻𝗴𝘂𝗮𝗴𝗲 𝗗𝗲𝘁𝗲𝗰𝘁𝗲𝗱
║ 👤 𝗨𝘀𝗲𝗿: @${event.senderID}
║ 📄 𝗠𝗲𝘀𝘀𝗮𝗴𝗲: Contains **Prohibited Word**
║ 🧹 𝗔𝗰𝘁𝗶𝗼𝗻: Delete/Unsend immediately
║ 📛 𝗧𝗵𝗶𝘀 𝗴𝗿𝗼𝘂𝗽 𝗶𝘀 𝗺𝗼𝗻𝗶𝘁𝗼𝗿𝗲𝗱 𝗯𝘆 𝗔𝘂𝘁𝗼𝗠𝗼𝗱
║ 🔁 𝗥𝗲𝗽𝗲𝗮𝘁 𝗢𝗳𝗳𝗲𝗻𝗰𝗲 = Mute/Ban
╚════════════════════════════════╝
⚠️ 𝗥𝗲𝗺𝗶𝗻𝗱𝗲𝗿: Use respectful language.`;

      return api.sendMessage(warningMsg, event.threadID, event.messageID);
    }
  } catch (err) {
    console.error(err);
  }
};

// Command to turn ON/OFF
module.exports.run = async function ({ api, event, args }) {
  if (args[0] === "on") {
    antiGaliStatus = true;
    return api.sendMessage("✅ 𝗔𝗻𝘁𝗶-𝗚𝗮𝗹𝗶 𝘀𝘆𝘀𝘁𝗲𝗺 𝗶𝘀 𝗻𝗼𝘄 **𝗢𝗡**", event.threadID);
  } 
  else if (args[0] === "off") {
    antiGaliStatus = false;
    return api.sendMessage("❌ 𝗔𝗻𝘁𝗶-𝗚𝗮𝗹𝗶 𝘀𝘆𝘀𝘁𝗲𝗺 𝗶𝘀 𝗻𝗼𝘄 **𝗢𝗙𝗙**", event.threadID);
  } 
  else {
    return api.sendMessage("Usage: !antigali on / !antigali off", event.threadID);
  }
};
