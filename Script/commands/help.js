const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "help",
  version: "1.0.8",
  hasPermssion: 0,
  credits: "rX",
  description: "Show full command list with GIF, and detailed info for !help [commandname]",
  commandCategory: "system",
  usages: "[command name]",
  cooldowns: 5,
  envConfig: {
    autoUnsend: true,
    delayUnsend: 30
  }
};

module.exports.run = function ({ api, event, args }) {
  const { commands } = global.client;
  const { threadID, messageID } = event;
  const prefix = global.config.PREFIX || "!";

  // Detailed info if command name is provided
  if (args[0]) {
    const cmd = commands.get(args[0].toLowerCase());
    if (!cmd) return api.sendMessage(`❌ Command '${args[0]}' not found.`, threadID, messageID);

    const config = cmd.config;
    const usage = config.usages ? `${prefix}${config.name} ${config.usages}` : `${prefix}${config.name}`;
    const prefixStatus = config.prefix === false ? "false" : "true";

    const infoMsg = `╭──────•◈•──────╮
│ Name: ${config.name}
│ Description: ${config.description || "Not provided"}
│ Usage: ${usage}
│ Category: ${config.commandCategory || "Other"}
│ Cooldowns: ${config.cooldowns || 0} sec
│ Permission: ${config.hasPermssion}
│ Prefix: ${prefixStatus}
╰──────•◈•──────╯`;

    return api.sendMessage(infoMsg, threadID, messageID);
  }

  // Full command list (same as previous)
  const totalCmds = commands.size;
  const message = `✨ [ Guide For Beginners ]

╭───× 𝐂𝐦𝐝 𝐋𝐢𝐬𝐭 ×───╮
│ ᰔ𝐌𝐚𝐫𝐢𝐚 × 𝐫𝐗 𝐂𝐡𝐚𝐭𝐛𝐨𝐭
│
│ ───× 
│ 𝗖𝗛𝗔𝗧 𝗔𝗜
│ ★baby ★mari
│ ★bot ★hippi
│ ★xan ★bby
 |
│ ───× 
│ 𝗚𝗥𝗢𝗨𝗣 𝗠𝗔𝗡𝗔𝗚𝗘
│ ★adduser ★kick
│ ★admin ★ban
│ ★unban ★warn
│ ★groupadmin ★listadmin
│ ★setname ★setemoji
│ ★rnamebox ★listbox
│
│ ───× 
│ 𝗔𝗡𝗧𝗜 & 𝗦𝗘𝗖𝗨𝗥𝗘
│ ★antigali ★antijoin
│ ★antikick ★antiout
│ ★autoban ★spamban
│ ★approve ★botban
│
│ ───× 
│ 𝗙𝗨𝗡 & 𝗟𝗢𝗩𝗘
│ ★pair ★gf
│ ★bestie ★marry
│ ★hug ★slap
│ ★truthordare ★truefalse
│ ★love ★crush
│ ★doya ★bf
│
│ ───× 
│ 𝗣𝗛𝗢𝗧𝗢 & 𝗩𝗜𝗗𝗘𝗢
│ ★getpix ★pixup
│ ★pic ★pinterest
│ ★imagesearch ★imagine
│ ★getvideo ★video
│ ★videomix ★pp
│ ★removebg ★fbcover
│ ★fbpost ★fbget
│
│ ───× 
│ 𝗔𝗨𝗗𝗜𝗢 & 𝗦𝗢𝗡𝗚
│ ★sing ★song
│ ★music ★mp3
│ ★lyrics ★voice
│ ★yt ★fyoutoo
│
│ ───× 
│ 𝗨𝗧𝗜𝗟𝗜𝗧𝗬
│ ★uptime ★resetexp
│ ★reload ★restart
│ ★system ★shell
│ ★info ★uid
│ ★uid2 ★numinfo
│ ★tid ★thread
│
│ ───× 
│ 𝗙𝗨𝗡𝗡𝗬 & 𝗠𝗘𝗠𝗘
│ ★meme ★toilet
│ ★sala ★by
│ ★hippi ★murgi
│ ★board ★bro
│ ★eyeroll ★poli
│
│ ───× 
│ 𝗘𝗫𝗧𝗥𝗔
│ ★help ★menu
│ ★console ★config
│ ★copy ★convert
│ ★clearcache ★cache
│ ★files ★cmdinstall
│
| ───×
| 𝗡𝗨𝗗𝗘 
| ★getfix (uid) ★pixlist
| ★pixup
╰─────────────⧕
╭─『 RX  CHAT BOT 』
╰‣ Total commands: ${totalCmds}
╰‣ A Facebook Bot
╰‣ CEO : Maria 🧃🐣
╰‣ ADMIN: rX Abdullah
╰‣ RIPORT FOR ISSUE,
   type !callad (yourtext)
`;

  const gifPath = path.join(__dirname, "cache", "help.gif");

  if (!fs.existsSync(gifPath)) {
    return api.sendMessage(message, threadID, messageID);
  }

  return api.sendMessage(
    {
      body: message,
      attachment: fs.createReadStream(gifPath)
    },
    threadID,
    messageID
  );
};
