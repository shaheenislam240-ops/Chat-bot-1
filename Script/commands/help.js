const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "help",
  version: "1.0.3",
  hasPermssion: 0,
  credits: "rX", //don't change this credit
  description: "Show all command list with GIF from cache",
  commandCategory: "system",
  usages: "[name module]",
  cooldowns: 5,
  envConfig: {
    autoUnsend: true,
    delayUnsend: 30
  }
};

module.exports.languages = {
  "en": {
    "moduleInfo": `╭──────•◈•──────╮\n |        𝗿𝗫 𝗖𝗵𝗮𝘁 𝗕𝗼𝘁\n |●𝗡𝗮𝗺𝗲: •—» %1 «—•\n |●𝗨𝘀𝗮𝗴𝗲: %3\n |●𝗗𝗲𝘀𝗰𝗿𝗶𝗽𝘁𝗶𝗼𝗻: %2\n |●𝗖𝗮𝘁𝗲𝗴𝗼𝗿𝘆: %4\n |●𝗪𝗮𝗶𝘁𝗶𝗻𝗴 𝘁𝗶𝗺𝗲: %5 second(s)\n |●𝗣𝗲𝗿𝗺𝗶𝘀𝘀𝗶𝗼𝗻: %6\n |𝗠𝗼𝗱𝘂𝗹𝗲 𝗰𝗼𝗱𝗲 𝗯𝘆\n |•—» rX Abdullah «—•\n╰──────•◈•──────╯`,
    "user": "User",
    "adminGroup": "Admin group",
    "adminBot": "Admin bot"
  }
};

module.exports.run = function ({ api, event }) {
  const { commands } = global.client;
  const { threadID, messageID } = event;
  const totalCmds = commands.size;

  const message = `✨ [ Guide For Beginners ]

╭───× 𝐜𝐦𝐝 𝐥𝐢𝐬𝐭 ×───╮
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

  // Path to your cached GIF file
  const gifPath = path.join(__dirname, "cache", "help.gif");

  if (!fs.existsSync(gifPath)) {
    return api.sendMessage("❌ help.gif not found in cache folder.", threadID, messageID);
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
